require('dotenv').config();
const mongoose = require('mongoose');

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    
    console.log(`\nFound ${users.length} user(s):`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
