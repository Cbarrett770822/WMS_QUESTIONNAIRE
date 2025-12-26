require('dotenv').config();
const mongoose = require('mongoose');
const Assessment = require('../netlify/functions/models/Assessment.js');
const Company = require('../netlify/functions/models/Company.js');
const Questionnaire = require('../netlify/functions/models/Questionnaire.js');
const User = require('../netlify/functions/models/User.js');

async function checkSampleAssessment() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Check for sample assessments
    const sampleAssessments = await Assessment.find({ isSample: true })
      .populate('company')
      .populate('questionnaire')
      .populate('user');
    
    console.log(`Found ${sampleAssessments.length} sample assessment(s)\n`);

    if (sampleAssessments.length > 0) {
      sampleAssessments.forEach((assessment, idx) => {
        console.log(`Sample Assessment #${idx + 1}:`);
        console.log(`  ID: ${assessment._id}`);
        console.log(`  Company: ${assessment.company?.name || 'N/A'}`);
        console.log(`  Questionnaire: ${assessment.questionnaire?.title || 'N/A'}`);
        console.log(`  User: ${assessment.user?.email || 'N/A'}`);
        console.log(`  Status: ${assessment.status}`);
        console.log(`  Answers: ${assessment.answers?.length || 0}`);
        console.log(`  Created: ${assessment.createdAt}`);
        console.log('');
      });
    } else {
      console.log('❌ No sample assessments found in database');
    }

    // Check all assessments
    const allAssessments = await Assessment.find({});
    console.log(`Total assessments in database: ${allAssessments.length}`);

    // Check other collections
    const companies = await Company.countDocuments();
    const questionnaires = await Questionnaire.countDocuments();
    const users = await User.countDocuments();

    console.log(`\nDatabase Summary:`);
    console.log(`  Companies: ${companies}`);
    console.log(`  Questionnaires: ${questionnaires}`);
    console.log(`  Users: ${users}`);
    console.log(`  Assessments: ${allAssessments.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Database check complete');
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  }
}

checkSampleAssessment();
