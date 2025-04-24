const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, default: 'active' },
  condition: { type: String, default: 'tốt' }, // Tình trạng thiết bị
  maintenanceDate: { type: Date }, // Ngày bảo dưỡng
  repairDate: { type: Date }, // Ngày sửa chữa
  notes: { type: String }, // Ghi chú
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Device', deviceSchema);
