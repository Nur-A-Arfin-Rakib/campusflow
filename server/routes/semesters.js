const router = require('express').Router();
const Semester = require('../models/Semester');
const { protect, allow } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try { res.json(await Semester.find().sort({ year: -1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', protect, allow('admin'), async (req, res) => {
  try { res.status(201).json(await Semester.create(req.body)); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.put('/:id', protect, allow('admin'), async (req, res) => {
  try { res.json(await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.delete('/:id', protect, allow('admin'), async (req, res) => {
  try { await Semester.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
