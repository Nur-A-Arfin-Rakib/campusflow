const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action:  { type: String, required: true },  // "CREATE", "UPDATE", "DELETE"
  model:   { type: String, required: true },  // "Routine", "Teacher", etc.
  docId:   { type: mongoose.Schema.Types.ObjectId },
  details: { type: String },
  ip:      { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditSchema);
