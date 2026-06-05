
const router = require('express').Router()
const { body } = require('express-validator')
const User = require('../models/User')
const { protect, allow } = require('../middleware/auth')
const validate = require('../middleware/validate')
const logger = require('../utils/logger')

// GET /api/users  — list with search + pagination
router.get('/', protect, allow('admin'), async (req, res) => {
  try {
    const { search, role, page = 1, limit = 50 } = req.query
    const filter = {}
    if (role && ['admin', 'teacher', 'student'].includes(role)) filter.role = role
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }
    const [data, total] = await Promise.all([
      User.find(filter)
        .select('-password -passwordResetToken -passwordResetExpires')
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit),
      User.countDocuments(filter),
    ])
    res.json({ data, total, page: +page, pages: Math.ceil(total / +limit) })
  } catch (err) {
    logger.error(`GET /users: ${err.message}`)
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/users/:id  — update role and/or isActive (admin only)
router.put('/:id', protect, allow('admin'), [
  body('role').optional().isIn(['admin', 'teacher', 'student']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
], validate, async (req, res) => {
  try {
    // Prevent admins from demoting themselves
    if (req.params.id === req.user._id.toString() && req.body.role && req.body.role !== 'admin') {
      return res.status(400).json({ message: 'You cannot change your own role' })
    }

    // Strip fields that must not be updated via this route
    const { role, isActive } = req.body
    const update = {}
    if (role !== undefined) update.role = role
    if (isActive !== undefined) update.isActive = isActive

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
      .select('-password -passwordResetToken -passwordResetExpires')

    if (!user) return res.status(404).json({ message: 'User not found' })

    logger.info(`Admin ${req.user.email} updated user ${user.email}: ${JSON.stringify(update)}`)
    res.json(user)
  } catch (err) {
    logger.error(`PUT /users/:id: ${err.message}`)
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/users/:id  — hard delete (admin only)
router.delete('/:id', protect, allow('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' })
    }
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    logger.info(`Admin ${req.user.email} deleted user ${user.email}`)
    res.json({ message: 'User deleted' })
  } catch (err) {
    logger.error(`DELETE /users/:id: ${err.message}`)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
