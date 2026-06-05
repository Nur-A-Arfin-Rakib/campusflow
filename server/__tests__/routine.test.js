const request = require('supertest')
const { app } = require('../index')
const User = require('../models/User')
const Department = require('../models/Department')
const Semester = require('../models/Semester')
const Teacher = require('../models/Teacher')
const Course = require('../models/Course')
const Room = require('../models/Room')

require('./setup')

// Helper: login and return cookies
const loginAs = async (role = 'admin') => {
  const email = `${role}@test.com`
  const user = await User.create({ name: role, email, password: 'password123', role })
  // Manually set role since register always sets student
  await User.findByIdAndUpdate(user._id, { role })

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'password123' })
  return res.headers['set-cookie']
}

// Helper: create test data
const createTestData = async () => {
  const dept = await Department.create({ name: 'Computer Science', shortName: 'CSE' })
  const sem  = await Semester.create({ name: 'Summer 2026', year: 2026, term: 'Summer', isActive: true })
  const teacher = await Teacher.create({ shortName: 'ARR', fullName: 'AKZ Rasel', designation: 'Lecturer', department: dept._id })
  const course  = await Course.create({ courseCode: 'CSE2205', courseTitle: 'Database', credit: 3, department: dept._id })
  const room    = await Room.create({ roomNo: '309', capacity: 40 })
  return { dept, sem, teacher, course, room }
}

describe('📅 Routine API', () => {

  describe('GET /api/routine', () => {
    it('should return routine list publicly (no auth needed)', async () => {
      const res = await request(app).get('/api/routine')
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('data')
      expect(res.body).toHaveProperty('total')
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('should support pagination', async () => {
      const res = await request(app).get('/api/routine?page=1&limit=5')
      expect(res.status).toBe(200)
      expect(res.body.page).toBe(1)
    })

    it('should filter by day', async () => {
      const res = await request(app).get('/api/routine?day=Sunday')
      expect(res.status).toBe(200)
      res.body.data.forEach(r => expect(r.dayName).toBe('Sunday'))
    })
  })

  describe('POST /api/routine', () => {
    it('should reject unauthenticated request', async () => {
      const res = await request(app).post('/api/routine').send({})
      expect(res.status).toBe(401)
    })

    it('should reject non-admin user', async () => {
      const cookies = await loginAs('student')
      const res = await request(app)
        .post('/api/routine')
        .set('Cookie', cookies)
        .send({})
      expect(res.status).toBe(403)
    })

    it('should create routine as admin', async () => {
      const cookies = await loginAs('admin')
      const { sem, teacher, course, room, dept } = await createTestData()

      const res = await request(app)
        .post('/api/routine')
        .set('Cookie', cookies)
        .send({
          dayName: 'Sunday', startTime: '09:00', endTime: '09:45',
          course: course._id, teacher: teacher._id, room: room._id,
          semester: sem._id, department: dept._id,
          levelTerm: '1-1', section: 'A',
        })

      expect(res.status).toBe(201)
      expect(res.body.dayName).toBe('Sunday')
    })

    it('should detect room conflict', async () => {
      const cookies = await loginAs('admin')
      const { sem, teacher, course, room, dept } = await createTestData()

      const payload = {
        dayName: 'Monday', startTime: '09:00', endTime: '09:45',
        course: course._id, teacher: teacher._id, room: room._id,
        semester: sem._id, department: dept._id, levelTerm: '1-1', section: 'A',
      }

      // First class
      await request(app).post('/api/routine').set('Cookie', cookies).send(payload)

      // Create another teacher to avoid teacher conflict
      const dept2 = await Department.create({ name: 'EEE', shortName: 'EEE' })
      const teacher2 = await Teacher.create({ shortName: 'XYZ', fullName: 'Another Teacher', designation: 'Lecturer', department: dept2._id })
      const course2  = await Course.create({ courseCode: 'EEE101', courseTitle: 'Circuits', credit: 3, department: dept2._id })

      // Same room, same time — should conflict
      const conflictRes = await request(app)
        .post('/api/routine')
        .set('Cookie', cookies)
        .send({ ...payload, teacher: teacher2._id, course: course2._id, section: 'B' })

      expect(conflictRes.status).toBe(409)
      expect(conflictRes.body.conflicts).toBeDefined()
      expect(conflictRes.body.conflicts.length).toBeGreaterThan(0)
    })

    it('should reject missing required fields', async () => {
      const cookies = await loginAs('admin')
      const res = await request(app)
        .post('/api/routine')
        .set('Cookie', cookies)
        .send({ dayName: 'Sunday' }) // missing many fields

      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /api/routine/:id', () => {
    it('should delete routine as admin', async () => {
      const cookies = await loginAs('admin')
      const { sem, teacher, course, room, dept } = await createTestData()

      const createRes = await request(app)
        .post('/api/routine')
        .set('Cookie', cookies)
        .send({
          dayName: 'Tuesday', startTime: '10:00', endTime: '10:45',
          course: course._id, teacher: teacher._id, room: room._id,
          semester: sem._id, department: dept._id, levelTerm: '2-1', section: 'B',
        })

      const id = createRes.body._id
      const delRes = await request(app).delete(`/api/routine/${id}`).set('Cookie', cookies)
      expect(delRes.status).toBe(200)
    })

    it('should return 404 for non-existent routine', async () => {
      const cookies = await loginAs('admin')
      const res = await request(app)
        .delete('/api/routine/64f1a2b3c4d5e6f7a8b9c0d1')
        .set('Cookie', cookies)
      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/routine/conflicts', () => {
    it('should require admin auth', async () => {
      const res = await request(app).get('/api/routine/conflicts')
      expect(res.status).toBe(401)
    })

    it('should return conflicts array for admin', async () => {
      const cookies = await loginAs('admin')
      const res = await request(app).get('/api/routine/conflicts').set('Cookie', cookies)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })
})
