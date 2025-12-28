require('dotenv').config();
const mongoose = require('mongoose');

async function checkAssessments() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    const db = mongoose.connection.db;
    const assessments = await db.collection('assessments').find({}).toArray();
    
    console.log(`\nFound ${assessments.length} assessment(s):`);
    for (const assessment of assessments) {
      const company = await db.collection('companies').findOne({ _id: assessment.company });
      console.log(`\n- ID: ${assessment._id}`);
      console.log(`  Company: ${company?.name || 'Unknown'}`);
      console.log(`  Status: ${assessment.status}`);
      console.log(`  Sample: ${assessment.isSample ? 'Yes (cannot be deleted)' : 'No'}`);
      console.log(`  Answers: ${assessment.answers?.length || 0}`);
      console.log(`  Created: ${assessment.createdAt}`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAssessments();
