require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
  appPermissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'users' });

async function updateUserPermissions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    // Get User model
    const User = mongoose.model('User', userSchema);

    // First, check current structure
    const sampleUser = await User.findOne({});
    console.log('Sample user appPermissions structure:', JSON.stringify(sampleUser?.appPermissions, null, 2));

    // Update all users - convert object to array with wms-questionnaire permission
    const result = await User.updateMany(
      {},
      { 
        $set: { 
          appPermissions: ['wms-questionnaire'] 
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} users with wms-questionnaire permission`);

    // Show all users and their permissions
    const users = await User.find({}, 'email username appPermissions role');
    console.log('\nCurrent users:');
    users.forEach(user => {
      const perms = Array.isArray(user.appPermissions) ? user.appPermissions.join(', ') : JSON.stringify(user.appPermissions);
      console.log(`- ${user.email} (${user.username}) [${user.role}]: ${perms}`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateUserPermissions();
