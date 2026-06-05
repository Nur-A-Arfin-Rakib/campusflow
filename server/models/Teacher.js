const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shortName:   { type: String, required: true, trim: true, uppercase: true },
  fullName:    { type: String, required: true, trim: true },
  designation: { type: String, required: true, trim: true },
  department:  { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  email:       { type: String, trim: true },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
