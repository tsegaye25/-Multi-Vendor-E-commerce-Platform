const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@example.com' 
    });

    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    };

    const admin = await User.create(adminData);
    console.log(`✅ Admin user created successfully: ${admin.email}`);
    console.log(`🔐 Admin credentials: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
};

module.exports = seedAdmin;
