const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNo:     { type: String, required: true, trim: true },
  building:   { type: String, trim: true },
  capacity:   { type: Number, default: 40 },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
