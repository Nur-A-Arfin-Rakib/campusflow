const router = require('express').Router();
const AuditLog = require('../models/AuditLog');
const { protect, allow } = require('../middleware/auth');

router.get('/', protect, allow('admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
