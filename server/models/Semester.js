const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true }, // e.g. "Summer 2026"
  year:      { type: Number, required: true },
  term:      { type: String, enum: ['Spring', 'Summer', 'Fall'], required: true },
  isActive:  { type: Boolean, default: false },
  startDate: { type: Date },
  endDate:   { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Semester', semesterSchema);
