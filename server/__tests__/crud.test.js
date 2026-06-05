const request = require('supertest')
const { app } = require('../index')
const User = require('../models/User')
const Department = require('../models/Department')

require('./setup')

const loginAs = async (role = 'admin') => {
  const email = `${role}_cr@test.com`
  await User.create({ name: role, email, password: 'password123', role })
  const res = await request(app).post('/api/auth/login').send({ email, password: 'password123' })
  return res.headers['set-cookie']
}

describe('👨‍🏫 Teachers API', () => {
  let dept, adminCookies

  beforeEach(async () => {
    dept = await Department.create({ name: 'CSE', shortName: 'CSE' })
    adminCookies = await loginAs('admin')
  })

  it('GET /api/teachers — public access', async () => {
    const res = await request(app).get('/api/teachers')
    expect(res.status).toBe(200)
  })

  it('POST /api/teachers — creates teacher as admin', async () => {
    const res = await request(app)
      .post('/api/teachers')
      .set('Cookie', adminCookies)
      .send({ shortName: 'ARR', fullName: 'AKZ Rasel', designation: 'Lecturer', department: dept._id })

    expect(res.status).toBe(201)
    expect(res.body.shortName).toBe('ARR')
  })

  it('POST /api/teachers — rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/teachers')
      .set('Cookie', adminCookies)
      .send({ shortName: 'X' }) // missing fullName, designation, department

    expect(res.status).toBe(400)
  })

  it('POST /api/teachers — rejects non-admin', async () => {
    const studentCookies = await loginAs('student')
    const res = await request(app)
      .post('/api/teachers')
      .set('Cookie', studentCookies)
      .send({ shortName: 'ARR', fullName: 'AKZ Rasel', designation: 'Lecturer', department: dept._id })

    expect(res.status).toBe(403)
  })

  it('DELETE /api/teachers/:id — deletes as admin', async () => {
    const create = await request(app)
      .post('/api/teachers')
      .set('Cookie', adminCookies)
      .send({ shortName: 'DEL', fullName: 'To Delete', designation: 'Lecturer', department: dept._id })

    const del = await request(app)
      .delete(`/api/teachers/${create.body._id}`)
      .set('Cookie', adminCookies)

    expect(del.status).toBe(200)
  })
})

describe('📚 Courses API', () => {
  let dept, adminCookies

  beforeEach(async () => {
    dept = await Department.create({ name: 'EEE', shortName: 'EEE' })
    adminCookies = await loginAs('admin')
  })

  it('GET /api/courses — public access', async () => {
    const res = await request(app).get('/api/courses')
    expect(res.status).toBe(200)
  })

  it('POST /api/courses — creates course as admin', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Cookie', adminCookies)
      .send({ courseCode: 'CSE2205', courseTitle: 'Database', credit: 3.75, department: dept._id })

    expect(res.status).toBe(201)
    expect(res.body.courseCode).toBe('CSE2205')
  })

  it('POST /api/courses — rejects non-numeric credit', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Cookie', adminCookies)
      .send({ courseCode: 'CSE001', courseTitle: 'Test', credit: 'abc', department: dept._id })

    expect(res.status).toBe(400)
  })
})

describe('🚪 Rooms API', () => {
  let adminCookies

  beforeEach(async () => { adminCookies = await loginAs('admin') })

  it('GET /api/rooms — public access', async () => {
    const res = await request(app).get('/api/rooms')
    expect(res.status).toBe(200)
  })

  it('POST /api/rooms — creates room as admin', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Cookie', adminCookies)
      .send({ roomNo: '309', capacity: 40 })

    expect(res.status).toBe(201)
    expect(res.body.roomNo).toBe('309')
  })
})

describe('🏛 Departments API', () => {
  let adminCookies

  beforeEach(async () => { adminCookies = await loginAs('admin') })

  it('GET /api/departments — public access', async () => {
    const res = await request(app).get('/api/departments')
    expect(res.status).toBe(200)
  })

  it('POST /api/departments — creates department', async () => {
    const res = await request(app)
      .post('/api/departments')
      .set('Cookie', adminCookies)
      .send({ name: 'Computer Science', shortName: 'CSE' })

    expect(res.status).toBe(201)
    expect(res.body.shortName).toBe('CSE')
  })

  it('POST /api/departments — rejects empty name', async () => {
    const res = await request(app)
      .post('/api/departments')
      .set('Cookie', adminCookies)
      .send({ name: '', shortName: '' })

    expect(res.status).toBe(400)
  })
})
