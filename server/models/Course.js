const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode:  { type: String, required: true, trim: true, uppercase: true },
  courseTitle: { type: String, required: true, trim: true },
  theory:      { type: Number, default: 0 },
  sessional:   { type: Number, default: 0 },
  credit:      { type: Number, required: true },
  department:  { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
