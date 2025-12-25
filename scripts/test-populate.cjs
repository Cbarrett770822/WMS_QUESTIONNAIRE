require('dotenv').config();
const mongoose = require('mongoose');
const Assessment = require('../netlify/functions/models/Assessment.js');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const userId = '69499faf9504d9b014cc7957';
    
    console.log('\nTrying to fetch with populate...');
    const assessments = await Assessment.find({ user: userId })
      .populate('questionnaire', 'title description')
      .populate('user', 'name email')
      .populate('company', 'name')
      .sort({ createdAt: -1 });

    console.log('Success! Found:', assessments.length);
    assessments.forEach(a => {
      console.log('\nAssessment:', a._id);
      console.log('  Questionnaire:', a.questionnaire);
      console.log('  User:', a.user);
      console.log('  Company:', a.company);
    });

  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
  }
}

test();
