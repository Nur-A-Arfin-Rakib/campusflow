const request = require('supertest')
const { app } = require('../index')
const User = require('../models/User')

require('./setup')

describe('🔐 Auth API', () => {

  // ─── REGISTER ─────────────────────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test@gmail.com', password: 'password123' })

      expect(res.status).toBe(201)
      expect(res.body.user).toBeDefined()
      expect(res.body.user.email).toBe('test@gmail.com')
      expect(res.body.user.password).toBeUndefined() // password must not be returned
    })

    it('should always set role to student regardless of input', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Hacker', email: 'hacker@gmail.com', password: 'pass123', role: 'admin' })

      expect(res.status).toBe(201)
      expect(res.body.user.role).toBe('student') // ✅ role hijack prevented
    })

    it('should reject duplicate email', async () => {
      await User.create({ name: 'Existing', email: 'existing@gmail.com', password: 'pass123' })

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Another', email: 'existing@gmail.com', password: 'pass123' })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/already exists/i)
    })

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User', email: 'user@gmail.com', password: '123' })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/min 6/i)
    })

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User', email: 'notanemail', password: 'password123' })

      expect(res.status).toBe(400)
    })

    it('should reject empty name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: '', email: 'user@gmail.com', password: 'password123' })

      expect(res.status).toBe(400)
    })
  })

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({ name: 'Login User', email: 'login@gmail.com', password: 'password123', role: 'admin' })
    })

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@gmail.com', password: 'password123' })

      expect(res.status).toBe(200)
      expect(res.body.user).toBeDefined()
      expect(res.body.user.email).toBe('login@gmail.com')
      // Cookie should be set
      expect(res.headers['set-cookie']).toBeDefined()
    })

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@gmail.com', password: 'wrongpassword' })

      expect(res.status).toBe(401)
      expect(res.body.message).toMatch(/invalid credentials/i)
    })

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@gmail.com', password: 'password123' })

      expect(res.status).toBe(401)
    })

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@gmail.com' }) // no password

      expect(res.status).toBe(400)
    })
  })

  // ─── ME ───────────────────────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app).get('/api/auth/me')
      expect(res.status).toBe(401)
    })

    it('should return user when authenticated', async () => {
      // Register then login to get cookie
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Me User', email: 'me@gmail.com', password: 'password123' })

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'me@gmail.com', password: 'password123' })

      const cookies = loginRes.headers['set-cookie']

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookies)

      expect(res.status).toBe(200)
      expect(res.body.email).toBe('me@gmail.com')
    })
  })

  // ─── CHANGE PASSWORD ──────────────────────────────────────────────────────
  describe('PUT /api/auth/change-password', () => {
    let cookies

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Pass User', email: 'pass@gmail.com', password: 'oldpassword' })

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'pass@gmail.com', password: 'oldpassword' })
      cookies = res.headers['set-cookie']
    })

    it('should change password with correct current password', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Cookie', cookies)
        .send({ currentPassword: 'oldpassword', newPassword: 'newpassword123' })

      expect(res.status).toBe(200)
    })

    it('should reject wrong current password', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Cookie', cookies)
        .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword123' })

      expect(res.status).toBe(400)
      expect(res.body.message).toMatch(/incorrect/i)
    })

    it('should reject short new password', async () => {
      const res = await request(app)
        .put('/api/auth/change-password')
        .set('Cookie', cookies)
        .send({ currentPassword: 'oldpassword', newPassword: '123' })

      expect(res.status).toBe(400)
    })
  })

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app).post('/api/auth/logout')
      expect(res.status).toBe(200)
      expect(res.body.message).toMatch(/logged out/i)
    })
  })

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
  describe('POST /api/auth/forgot-password', () => {
    it('should always return 200 (prevent email enumeration)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@gmail.com' })

      expect(res.status).toBe(200) // always 200, even if email doesn't exist
    })
  })
})
