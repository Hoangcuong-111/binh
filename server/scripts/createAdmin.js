const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/device_manager', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Kiểm tra xem đã có admin chưa
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Tài khoản admin đã tồn tại');
      process.exit(0);
    }

    // Tạo tài khoản admin mới
    const adminUser = new User({
      username: 'admin',
      password: 'admin123',
      fullName: 'Administrator',
      email: 'admin@example.com',
      role: 'admin'
    });

    await adminUser.save();
    console.log('Tạo tài khoản admin thành công');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
};

createAdminUser();