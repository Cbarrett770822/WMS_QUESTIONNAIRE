require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../netlify/functions/models/User.js');

async function initDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const adminExists = await User.findOne({ email: 'admin@wmsquestion.com' });
    if (!adminExists) {
      const admin = new User({
        email: 'admin@wmsquestion.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin user created: admin@wmsquestion.com / admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('✅ Database initialization complete');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

initDatabase();
