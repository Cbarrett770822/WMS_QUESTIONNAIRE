require('dotenv').config();
const mongoose = require('mongoose');

// Define schemas inline
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

const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);

async function cleanupOrphanedAssessments() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Find assessments with no company or no user
    const orphanedAssessments = await Assessment.find({
      $or: [
        { company: null },
        { user: null },
        { answers: { $size: 0 } }
      ]
    });

    console.log(`Found ${orphanedAssessments.length} orphaned assessment(s)\n`);

    if (orphanedAssessments.length > 0) {
      console.log('Orphaned Assessments:');
      orphanedAssessments.forEach((assessment, idx) => {
        console.log(`  ${idx + 1}. ID: ${assessment._id}`);
        console.log(`     Company: ${assessment.company || 'NULL'}`);
        console.log(`     User: ${assessment.user || 'NULL'}`);
        console.log(`     Answers: ${assessment.answers?.length || 0}`);
        console.log(`     Created: ${assessment.createdAt}`);
        console.log('');
      });

      console.log('Deleting orphaned assessments...');
      const result = await Assessment.deleteMany({
        $or: [
          { company: null },
          { user: null },
          { answers: { $size: 0 } }
        ]
      });

      console.log(`✅ Deleted ${result.deletedCount} orphaned assessment(s)`);
    } else {
      console.log('No orphaned assessments found');
    }

    await mongoose.connection.close();
    console.log('\n✅ Cleanup complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupOrphanedAssessments();
