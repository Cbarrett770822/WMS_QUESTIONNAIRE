require('dotenv').config();
const mongoose = require('mongoose');

// Define schemas inline to avoid registration issues
const companySchema = new mongoose.Schema({
  name: String,
  industry: String,
  size: String,
  address: Object,
  contact: Object
});

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String
});

const assessmentSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  questionnaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Questionnaire' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: Array,
  status: String,
  isSample: Boolean,
  createdAt: Date,
  completedAt: Date
});

const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);

async function listAssessmentCompanies() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const assessments = await Assessment.find({})
      .populate('company')
      .populate('user')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${assessments.length} assessment(s)\n`);
    console.log('═'.repeat(80));

    if (assessments.length > 0) {
      assessments.forEach((assessment, idx) => {
        console.log(`\nAssessment #${idx + 1}:`);
        console.log(`  Company Name: ${assessment.company?.name || 'N/A'}`);
        console.log(`  Assessment ID: ${assessment._id}`);
        console.log(`  Status: ${assessment.status}`);
        console.log(`  User: ${assessment.user?.email || 'N/A'}`);
        console.log(`  Answers: ${assessment.answers?.length || 0}`);
        console.log(`  Is Sample: ${assessment.isSample ? 'Yes' : 'No'}`);
        console.log(`  Created: ${new Date(assessment.createdAt).toLocaleString()}`);
        if (assessment.completedAt) {
          console.log(`  Completed: ${new Date(assessment.completedAt).toLocaleString()}`);
        }
      });
    } else {
      console.log('No assessments found in database');
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\nCompany Summary:');
    const companyNames = [...new Set(assessments.map(a => a.company?.name).filter(Boolean))];
    companyNames.forEach((name, idx) => {
      const count = assessments.filter(a => a.company?.name === name).length;
      console.log(`  ${idx + 1}. ${name} (${count} assessment${count > 1 ? 's' : ''})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listAssessmentCompanies();
