/**
 * CampusFlow — Demo Data Seeder
 * Usage: node seeder.js
 * Add MONGO_URI to .env or pass directly below
 */

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// ── Models ────────────────────────────────────────────────────────────────────
const User       = require('./models/User')
const Department = require('./models/Department')
const Teacher    = require('./models/Teacher')
const Course     = require('./models/Course')
const Room       = require('./models/Room')
const Semester   = require('./models/Semester')
const Routine    = require('./models/Routine')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campusflow'

async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log('✅ Connected to MongoDB')

  // ── Clear existing data ──────────────────────────────────────────────────
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Teacher.deleteMany({}),
    Course.deleteMany({}),
    Room.deleteMany({}),
    Semester.deleteMany({}),
    Routine.deleteMany({}),
  ])
  console.log('🗑  Cleared old data')

  // ── Admin User ────────────────────────────────────────────────────────────
  const admin = await User.create({
    name:     'Admin User',
    email:    'admin@campusflow.demo',
    password: 'admin1234',   // hashed by pre-save hook
    role:     'admin',
    isActive: true,
  })
  console.log('👤 Admin created  →  admin@campusflow.demo / admin1234')

  // ── Departments ───────────────────────────────────────────────────────────
  const [cse, eee, bba] = await Department.insertMany([
    { name: 'Computer Science & Engineering',    shortName: 'CSE', createdBy: admin._id },
    { name: 'Electrical & Electronic Engineering', shortName: 'EEE', createdBy: admin._id },
    { name: 'Business Administration',            shortName: 'BBA', createdBy: admin._id },
  ])
  console.log('🏛  Departments created')

  // ── Rooms ─────────────────────────────────────────────────────────────────
  const rooms = await Room.insertMany([
    { roomNo: '101', building: 'Academic Block A', capacity: 45, department: cse._id, isActive: true },
    { roomNo: '102', building: 'Academic Block A', capacity: 45, department: cse._id, isActive: true },
    { roomNo: '201', building: 'Academic Block B', capacity: 50, department: eee._id, isActive: true },
    { roomNo: '202', building: 'Academic Block B', capacity: 50, department: eee._id, isActive: true },
    { roomNo: 'Lab-1', building: 'CS Lab Building', capacity: 30, department: cse._id, isActive: true },
    { roomNo: 'Lab-2', building: 'CS Lab Building', capacity: 30, department: cse._id, isActive: true },
    { roomNo: '301', building: 'Business Faculty',  capacity: 60, department: bba._id, isActive: true },
  ])
  const [r101, r102, r201, r202, rLab1, rLab2, r301] = rooms
  console.log('🚪 Rooms created')

  // ── Teachers ──────────────────────────────────────────────────────────────
  const teachers = await Teacher.insertMany([
    { shortName: 'ARR', fullName: 'Dr. Anisur Rahman',   designation: 'Professor, CSE',        department: cse._id, email: 'arr@campusflow.demo',  isActive: true },
    { shortName: 'SKD', fullName: 'Sumon Kumar Das',     designation: 'Associate Professor, CSE', department: cse._id, email: 'skd@campusflow.demo',  isActive: true },
    { shortName: 'MNH', fullName: 'Mehedi Nur Hossain',  designation: 'Lecturer, CSE',          department: cse._id, email: 'mnh@campusflow.demo',  isActive: true },
    { shortName: 'RSJ', fullName: 'Dr. Rafiqul Islam',   designation: 'Professor, EEE',         department: eee._id, email: 'rsj@campusflow.demo',  isActive: true },
    { shortName: 'TKB', fullName: 'Tahmina Khanam',      designation: 'Lecturer, EEE',          department: eee._id, email: 'tkb@campusflow.demo',  isActive: true },
    { shortName: 'SMR', fullName: 'Dr. Salma Rahman',    designation: 'Professor, BBA',         department: bba._id, email: 'smr@campusflow.demo',  isActive: true },
  ])
  const [tARR, tSKD, tMNH, tRSJ, tTKB, tSMR] = teachers
  console.log('👨‍🏫 Teachers created')

  // ── Courses ───────────────────────────────────────────────────────────────
  const courses = await Course.insertMany([
    // CSE
    { courseCode: 'CSE101', courseTitle: 'Introduction to Programming',   credit: 3, theory: 3, sessional: 0, department: cse._id, createdBy: admin._id },
    { courseCode: 'CSE102', courseTitle: 'Programming Lab',               credit: 1, theory: 0, sessional: 1, department: cse._id, createdBy: admin._id },
    { courseCode: 'CSE201', courseTitle: 'Data Structures & Algorithms',  credit: 3, theory: 3, sessional: 0, department: cse._id, createdBy: admin._id },
    { courseCode: 'CSE202', courseTitle: 'Data Structures Lab',           credit: 1, theory: 0, sessional: 1, department: cse._id, createdBy: admin._id },
    { courseCode: 'CSE301', courseTitle: 'Database Management Systems',   credit: 3, theory: 3, sessional: 0, department: cse._id, createdBy: admin._id },
    { courseCode: 'CSE401', courseTitle: 'Software Engineering',          credit: 3, theory: 3, sessional: 0, department: cse._id, createdBy: admin._id },
    // EEE
    { courseCode: 'EEE101', courseTitle: 'Basic Electrical Engineering',  credit: 3, theory: 3, sessional: 0, department: eee._id, createdBy: admin._id },
    { courseCode: 'EEE201', courseTitle: 'Circuit Theory',                credit: 3, theory: 3, sessional: 0, department: eee._id, createdBy: admin._id },
    // BBA
    { courseCode: 'BBA101', courseTitle: 'Principles of Management',      credit: 3, theory: 3, sessional: 0, department: bba._id, createdBy: admin._id },
    { courseCode: 'BBA201', courseTitle: 'Financial Accounting',          credit: 3, theory: 3, sessional: 0, department: bba._id, createdBy: admin._id },
  ])
  const [cCSE101, cCSE102, cCSE201, cCSE202, cCSE301, cCSE401, cEEE101, cEEE201, cBBA101, cBBA201] = courses
  console.log('📚 Courses created')

  // ── Semester ──────────────────────────────────────────────────────────────
  const semester = await Semester.create({
    name:      'Fall 2025',
    year:      2025,
    term:      'Fall',
    isActive:  true,
    startDate: new Date('2025-09-01'),
    endDate:   new Date('2025-12-31'),
  })
  console.log('📅 Semester created')

  // ── Routine ───────────────────────────────────────────────────────────────
  // Helper: routine entry
  const R = (day, start, end, course, teacher, room, levelTerm, section) => ({
    semester:   semester._id,
    department: course.department,
    dayName:    day,
    startTime:  start,
    endTime:    end,
    course:     course._id,
    teacher:    teacher._id,
    room:       room._id,
    levelTerm,
    section,
    createdBy:  admin._id,
  })

  await Routine.insertMany([
    // ── CSE — Level 1, Term 1, Section A ─────────────────────────────────
    R('Sunday',    '08:00', '09:30', cCSE101, tARR, r101, '1-1', 'A'),
    R('Sunday',    '09:30', '11:00', cCSE201, tSKD, r101, '1-1', 'A'),
    R('Monday',    '08:00', '09:30', cCSE101, tARR, r101, '1-1', 'A'),
    R('Monday',    '09:30', '11:00', cCSE301, tMNH, r101, '1-1', 'A'),
    R('Tuesday',   '08:00', '09:30', cCSE201, tSKD, r101, '1-1', 'A'),
    R('Wednesday', '08:00', '09:30', cCSE101, tARR, r101, '1-1', 'A'),
    R('Wednesday', '11:00', '13:30', cCSE102, tMNH, rLab1, '1-1', 'A'), // Lab
    R('Thursday',  '08:00', '09:30', cCSE301, tMNH, r101, '1-1', 'A'),

    // ── CSE — Level 2, Term 1, Section A ─────────────────────────────────
    R('Sunday',    '11:00', '12:30', cCSE201, tSKD, r102, '2-1', 'A'),
    R('Monday',    '11:00', '12:30', cCSE301, tMNH, r102, '2-1', 'A'),
    R('Tuesday',   '11:00', '12:30', cCSE401, tARR, r102, '2-1', 'A'),
    R('Wednesday', '11:00', '12:30', cCSE201, tSKD, r102, '2-1', 'A'),
    R('Thursday',  '11:00', '12:30', cCSE401, tARR, r102, '2-1', 'A'),
    R('Thursday',  '14:00', '16:30', cCSE202, tSKD, rLab2, '2-1', 'A'), // Lab

    // ── EEE — Level 1, Term 1, Section A ─────────────────────────────────
    R('Sunday',    '08:00', '09:30', cEEE101, tRSJ, r201, '1-1', 'A'),
    R('Monday',    '08:00', '09:30', cEEE201, tTKB, r201, '1-1', 'A'),
    R('Tuesday',   '08:00', '09:30', cEEE101, tRSJ, r201, '1-1', 'A'),
    R('Wednesday', '08:00', '09:30', cEEE201, tTKB, r201, '1-1', 'A'),
    R('Thursday',  '08:00', '09:30', cEEE101, tRSJ, r201, '1-1', 'A'),

    // ── BBA — Level 1, Term 1, Section A ─────────────────────────────────
    R('Sunday',    '09:30', '11:00', cBBA101, tSMR, r301, '1-1', 'A'),
    R('Monday',    '09:30', '11:00', cBBA201, tSMR, r301, '1-1', 'A'),
    R('Tuesday',   '09:30', '11:00', cBBA101, tSMR, r301, '1-1', 'A'),
    R('Wednesday', '09:30', '11:00', cBBA201, tSMR, r301, '1-1', 'A'),
    R('Thursday',  '09:30', '11:00', cBBA101, tSMR, r301, '1-1', 'A'),
  ])
  console.log('📋 Routine created (25 class slots)')

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 Seeding complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔑  Admin Login:')
  console.log('    Email   : admin@campusflow.demo')
  console.log('    Password: admin1234')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  await mongoose.disconnect()
}

seed().catch(err => {
  console.error('❌ Seeder failed:', err.message)
  process.exit(1)
})
