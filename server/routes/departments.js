const router = require('express').Router()
const { body } = require('express-validator')
const Department = require('../models/Department')
const { protect, allow } = require('../middleware/auth')
const validate = require('../middleware/validate')

router.get('/', async (req, res) => {
  try { res.json(await Department.find()) }
  catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/', protect, allow('admin'), [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('shortName').trim().notEmpty().withMessage('Short name required'),
], validate, async (req, res) => {
  try { res.status(201).json(await Department.create({ ...req.body, createdBy: req.user._id })) }
  catch (err) { res.status(500).json({ message: err.message }) }
})

router.put('/:id', protect, allow('admin'), async (req, res) => {
  try { res.json(await Department.findByIdAndUpdate(req.params.id, req.body, { new: true })) }
  catch (err) { res.status(500).json({ message: err.message }) }
})

router.delete('/:id', protect, allow('admin'), async (req, res) => {
  try { await Department.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }) }
  catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
