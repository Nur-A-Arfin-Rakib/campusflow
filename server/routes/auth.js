const router = require('express').Router()
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { body } = require('express-validator')
const User = require('../models/User')
const RefreshToken = require('../models/RefreshToken')
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')
const { loginLimiter } = require('../middleware/rateLimiter')
const { sendWelcome, sendPasswordChanged, sendPasswordReset } = require('../utils/email')
const logger = require('../utils/logger')

const isProd = process.env.NODE_ENV === 'production'

const signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' })

const createRefreshToken = async (userId) => {
  const token = crypto.randomBytes(64).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await RefreshToken.create({ user: userId, token, expiresAt })
  return token
}

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 15 * 60 * 1000,
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  })
}

// ─── REGISTER ───────────────────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], validate, async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already exists' })

    const user = await User.create({ name, email, password, role: 'student' })
    const accessToken  = signAccess(user._id)
    const refreshToken = await createRefreshToken(user._id)

    setCookies(res, accessToken, refreshToken)
    sendWelcome(user)
    logger.info(`Registered: ${email}`)
    res.status(201).json({ user })
  } catch (err) {
    logger.error(`Register error: ${err.message}`)
    res.status(500).json({ message: err.message })
  }
})

// ─── LOGIN ───────────────────────────────────────────────────────────────────
router.post('/login', loginLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], validate, async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      logger.warn(`Failed login: ${email}`)
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const accessToken  = signAccess(user._id)
    const refreshToken = await createRefreshToken(user._id)

    setCookies(res, accessToken, refreshToken)
    logger.info(`Login: ${email}`)
    res.json({ user })
  } catch (err) {
    logger.error(`Login error: ${err.message}`)
    res.status(500).json({ message: err.message })
  }
})

// ─── REFRESH ─────────────────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) return res.status(401).json({ message: 'No refresh token' })

    const stored = await RefreshToken.findOne({ token }).populate('user')
    if (!stored || stored.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ token })
      res.clearCookie('accessToken')
      res.clearCookie('refreshToken')
      return res.status(401).json({ message: 'Session expired. Please log in again.' })
    }

    await RefreshToken.deleteOne({ token })
    const newRefresh = await createRefreshToken(stored.user._id)
    const accessToken = signAccess(stored.user._id)

    setCookies(res, accessToken, newRefresh)
    res.json({ user: stored.user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken
    if (token) await RefreshToken.deleteOne({ token })
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' })
    res.json({ message: 'Logged out' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// ─── ME ──────────────────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => res.json(req.user))

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────
router.post('/forgot-password', loginLimiter, [
  body('email').isEmail().withMessage('Valid email required'),
], validate, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' })

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000)
    await user.save({ validateBeforeSave: false })

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    sendPasswordReset(user, resetUrl)
    logger.info(`Password reset requested: ${user.email}`)
    res.json({ message: 'If that email exists, a reset link was sent.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
], validate, async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    })
    if (!user) return res.status(400).json({ message: 'Token is invalid or expired' })

    user.password = req.body.password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    await RefreshToken.deleteMany({ user: user._id })
    sendPasswordChanged(user)
    logger.info(`Password reset: ${user.email}`)
    res.json({ message: 'Password reset successful. Please log in.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ─── CHANGE PASSWORD ─────────────────────────────────────────────────────────
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password min 6 chars'),
], validate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!(await user.comparePassword(req.body.currentPassword)))
      return res.status(400).json({ message: 'Current password is incorrect' })

    user.password = req.body.newPassword
    await user.save()
    await RefreshToken.deleteMany({ user: user._id })
    sendPasswordChanged(user)
    logger.info(`Password changed: ${user.email}`)
    res.json({ message: 'Password changed. Please log in again.' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router