const router = require('express').Router()
const { body } = require('express-validator')
const Teacher = require('../models/Teacher')
const { protect, allow } = require('../middleware/auth')
const audit = require('../middleware/audit')
const validate = require('../middleware/validate')

const rules = [
  body('shortName').trim().notEmpty().withMessage('Short name is required'),
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
  body('department').notEmpty().withMessage('Department is required'),
]

router.get('/', async (req, res) => {
  try {
    const filter = req.query.department ? { department: req.query.department } : {}
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      Teacher.find(filter).populate('department','name shortName').skip(skip).limit(limit),
      Teacher.countDocuments(filter)
    ])
    res.json({ data, total, page, pages: Math.ceil(total / limit) })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/', protect, allow('admin'), rules, validate, audit('CREATE','Teacher'), async (req, res) => {
  try {
    const doc = await Teacher.create(req.body)
    res.status(201).json(await doc.populate('department','name shortName'))
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.put('/:id', protect, allow('admin'), audit('UPDATE','Teacher'), async (req, res) => {
  try {
    const doc = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('department','name shortName')
    if (!doc) return res.status(404).json({ message: 'Not found' })
    res.json(doc)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.delete('/:id', protect, allow('admin'), audit('DELETE','Teacher'), async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
