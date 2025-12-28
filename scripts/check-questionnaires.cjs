require('dotenv').config();
const mongoose = require('mongoose');
const Questionnaire = require('../netlify/functions/models/Questionnaire.js');

async function checkQuestionnaires() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    const questionnaires = await Questionnaire.find({});
    console.log(`\nFound ${questionnaires.length} questionnaire(s) in database`);
    
    if (questionnaires.length > 0) {
      questionnaires.forEach((q, index) => {
        console.log(`\n--- Questionnaire ${index + 1} ---`);
        console.log('ID:', q._id);
        console.log('Title:', q.title);
        console.log('Description:', q.description);
        console.log('Version:', q.version);
        console.log('Active:', q.isActive);
        console.log('Sections:', q.sections?.length || 0);
        console.log('Created:', q.createdAt);
      });
    } else {
      console.log('\n⚠️  No questionnaires found in database!');
      console.log('You need to run a seed script to create questionnaires.');
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkQuestionnaires();
