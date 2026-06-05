const router = require('express').Router()
const { body } = require('express-validator')
const Course = require('../models/Course')
const { protect, allow } = require('../middleware/auth')
const audit = require('../middleware/audit')
const validate = require('../middleware/validate')

const rules = [
  body('courseCode').trim().notEmpty().withMessage('Course code is required'),
  body('courseTitle').trim().notEmpty().withMessage('Course title is required'),
  body('credit').isNumeric().withMessage('Credit must be a number'),
  body('department').notEmpty().withMessage('Department is required'),
]

router.get('/', async (req, res) => {
  try {
    const filter = req.query.department ? { department: req.query.department } : {}
    if (req.query.search) filter.courseCode = { $regex: req.query.search, $options: 'i' }
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const [data, total] = await Promise.all([
      Course.find(filter).populate('department','name shortName').skip((page-1)*limit).limit(limit),
      Course.countDocuments(filter)
    ])
    res.json({ data, total, page, pages: Math.ceil(total/limit) })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/', protect, allow('admin'), rules, validate, audit('CREATE','Course'), async (req, res) => {
  try { res.status(201).json(await Course.create({ ...req.body, createdBy: req.user._id })) }
  catch (err) { res.status(500).json({ message: err.message }) }
})

router.put('/:id', protect, allow('admin'), audit('UPDATE','Course'), async (req, res) => {
  try { res.json(await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })) }
  catch (err) { res.status(500).json({ message: err.message }) }
})

router.delete('/:id', protect, allow('admin'), audit('DELETE','Course'), async (req, res) => {
  try { await Course.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }) }
  catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
