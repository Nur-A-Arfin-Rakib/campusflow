const mongoose = require('mongoose')

const routineSchema = new mongoose.Schema({
  semester:   { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  dayName:    { type: String, enum: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], required: true },
  startTime:  { type: String, required: true },
  endTime:    { type: String, required: true },
  course:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher:    { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  room:       { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  levelTerm:  { type: String, required: true },
  section:    { type: String, required: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

// Compound index for fast conflict queries
routineSchema.index({ semester: 1, dayName: 1, room: 1 })
routineSchema.index({ semester: 1, dayName: 1, teacher: 1 })
routineSchema.index({ semester: 1, department: 1, section: 1 })

module.exports = mongoose.model('Routine', routineSchema)
