const router = require('express').Router()
const { body } = require('express-validator')
const Routine = require('../models/Routine')
const { protect, allow } = require('../middleware/auth')
const audit = require('../middleware/audit')
const validate = require('../middleware/validate')

const populate = [
  { path: 'course',     select: 'courseCode courseTitle credit' },
  { path: 'teacher',    select: 'shortName fullName designation' },
  { path: 'room',       select: 'roomNo building' },
  { path: 'semester',   select: 'name term year' },
  { path: 'department', select: 'name shortName' },
  { path: 'createdBy',  select: 'name email' },
]

const rules = [
  body('dayName').notEmpty().withMessage('Day is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('course').notEmpty().withMessage('Course is required'),
  body('teacher').notEmpty().withMessage('Teacher is required'),
  body('room').notEmpty().withMessage('Room is required'),
  body('semester').notEmpty().withMessage('Semester is required'),
  body('levelTerm').notEmpty().withMessage('Level-Term is required'),
  body('section').notEmpty().withMessage('Section is required'),
]

async function checkConflict(data, excludeId = null) {
  const { dayName, startTime, endTime, room, teacher, semester } = data
  const base = { dayName, semester }
  if (excludeId) base._id = { $ne: excludeId }
  const timeOverlap = { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
  const [roomConflict, teacherConflict] = await Promise.all([
    Routine.findOne({ ...base, room, ...timeOverlap }),
    Routine.findOne({ ...base, teacher, ...timeOverlap }),
  ])
  const conflicts = []
  if (roomConflict) conflicts.push(`Room conflict with class at ${roomConflict.startTime}–${roomConflict.endTime}`)
  if (teacherConflict) conflicts.push(`Teacher conflict with class at ${teacherConflict.startTime}–${teacherConflict.endTime}`)
  return conflicts
}

// GET /api/routine  (public)
router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.semester)   filter.semester   = req.query.semester
    if (req.query.department) filter.department = req.query.department
    if (req.query.section)    filter.section    = req.query.section
    if (req.query.levelTerm)  filter.levelTerm  = req.query.levelTerm
    if (req.query.day)        filter.dayName    = req.query.day
    if (req.query.teacher)    filter.teacher    = req.query.teacher

    // Search by course code or title
    if (req.query.search) {
      const courses = require('../models/Course')
      const found = await courses.find({
        $or: [
          { courseCode:  { $regex: req.query.search, $options: 'i' } },
          { courseTitle: { $regex: req.query.search, $options: 'i' } },
        ]
      }).select('_id')
      filter.course = { $in: found.map(c => c._id) }
    }

    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 100
    const skip  = (page - 1) * limit

    const [data, total] = await Promise.all([
      Routine.find(filter).populate(populate).sort({ dayName: 1, startTime: 1 }).skip(skip).limit(limit),
      Routine.countDocuments(filter),
    ])
    res.json({ data, total, page, pages: Math.ceil(total / limit) })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/routine/conflicts
router.get('/conflicts', protect, allow('admin'), async (req, res) => {
  try {
    const filter = req.query.semester ? { semester: req.query.semester } : {}
    const all = await Routine.find(filter).populate(populate)
    const conflicts = []
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i], b = all[j]
        if (a.dayName !== b.dayName) continue
        if (a.startTime >= b.endTime || b.startTime >= a.endTime) continue
        const roomClash    = a.room?._id?.equals(b.room?._id)
        const teacherClash = a.teacher?._id?.equals(b.teacher?._id)
        if (roomClash || teacherClash)
          conflicts.push({ a, b, type: roomClash ? 'room' : 'teacher' })
      }
    }
    res.json(conflicts)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/routine/:id
router.get('/:id', async (req, res) => {
  try {
    const doc = await Routine.findById(req.params.id).populate(populate)
    if (!doc) return res.status(404).json({ message: 'Not found' })
    res.json(doc)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// POST /api/routine
router.post('/', protect, allow('admin'), rules, validate, audit('CREATE','Routine'), async (req, res) => {
  try {
    const conflicts = await checkConflict(req.body)
    if (conflicts.length) return res.status(409).json({ message: 'Conflict detected', conflicts })
    const doc = await Routine.create({ ...req.body, createdBy: req.user._id })
    res.status(201).json(await doc.populate(populate))
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PUT /api/routine/:id
router.put('/:id', protect, allow('admin'), audit('UPDATE','Routine'), async (req, res) => {
  try {
    const conflicts = await checkConflict(req.body, req.params.id)
    if (conflicts.length) return res.status(409).json({ message: 'Conflict detected', conflicts })
    const doc = await Routine.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(populate)
    if (!doc) return res.status(404).json({ message: 'Not found' })
    res.json(doc)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// DELETE /api/routine/:id
router.delete('/:id', protect, allow('admin'), audit('DELETE','Routine'), async (req, res) => {
  try {
    const doc = await Routine.findByIdAndDelete(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
