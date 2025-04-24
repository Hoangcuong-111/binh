const mongoose = require('mongoose');

const deviceHistorySchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete'],
    required: true
  },
  changes: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DeviceHistory', deviceHistorySchema);