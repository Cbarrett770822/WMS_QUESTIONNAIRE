require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const part1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-part1.json'), 'utf8'));
const part2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-part2.json'), 'utf8'));
const per = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-per.json'), 'utf8'));
const sys = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-sys.json'), 'utf8'));
const inv = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-inv-new.json'), 'utf8'));
const rcv = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-rcv.json'), 'utf8'));
const sto = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-sto.json'), 'utf8'));
const pck = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-pck.json'), 'utf8'));
const shp = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-shp.json'), 'utf8'));
const ret = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-ret-new.json'), 'utf8'));
const rpt = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-rpt.json'), 'utf8'));
const qc = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-qc.json'), 'utf8'));
const met = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-met.json'), 'utf8'));
const fut = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-fut.json'), 'utf8'));
const val = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers-val-new.json'), 'utf8'));

const sampleAnswers = [...part1, ...part2, ...per, ...sys, ...inv, ...rcv, ...sto, ...pck, ...shp, ...ret, ...rpt, ...qc, ...met, ...fut, ...val];

async function seedSampleAssessment() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    const db = mongoose.connection.db;

    // Get or create sample company
    let sampleCompany = await db.collection('companies').findOne({ name: '3PL Sample Company' });
    if (!sampleCompany) {
      const result = await db.collection('companies').insertOne({
        name: '3PL Sample Company',
        industry: 'Third-Party Logistics',
        size: 'large',
        address: { street: '123 Logistics Drive', city: 'Memphis', state: 'TN', country: 'USA', zipCode: '38103' },
        contact: { phone: '+1-555-0123', email: 'john.sample@3plsample.com' },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      sampleCompany = { _id: result.insertedId };
      console.log('Created sample company');
    } else {
      console.log('Sample company already exists');
    }

    // Get admin user
    const adminUser = await db.collection('users').findOne({ email: 'admin@wms.com' });
    if (!adminUser) {
      throw new Error('Admin user not found. Please ensure admin@wms.com exists.');
    }
    console.log('Found admin user');

    // Get questionnaire
    const questionnaire = await db.collection('questionnaires').findOne({ title: 'Infor WMS Questionnaire' });
    if (!questionnaire) {
      throw new Error('Questionnaire not found. Please run seed-comprehensive-questionnaire.cjs first.');
    }
    console.log('Found questionnaire');

    // Delete existing sample assessment if exists
    const deleteResult = await db.collection('assessments').deleteMany({ 
      company: sampleCompany._id, 
      isSample: true 
    });
    if (deleteResult.deletedCount > 0) {
      console.log('Deleted existing sample assessment');
    }

    // Create sample assessment
    const assessment = {
      company: sampleCompany._id,
      questionnaire: questionnaire._id,
      user: adminUser._id,
      answers: sampleAnswers,
      status: 'completed',
      isSample: true,
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('assessments').insertOne(assessment);
    console.log(`✅ Sample assessment created with ${sampleAnswers.length} answers`);
    console.log('   Company: 3PL Sample Company');
    console.log('   Status: completed');
    console.log('   Sample: Yes (cannot be deleted)');

    await mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedSampleAssessment();
