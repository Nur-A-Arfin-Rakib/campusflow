const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  shortName: { type: String, required: true, trim: true, uppercase: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
