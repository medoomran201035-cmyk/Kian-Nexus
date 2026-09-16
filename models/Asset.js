const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetName: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  category: { type: String, enum: ['Laptops', 'Mobiles', 'Networks', 'Office Tools'], required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  assignDate: { type: Date, default: null },
  status: { type: String, enum: ['Available', 'Assigned', 'Maintenance', 'Damaged'], default: 'Available' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);