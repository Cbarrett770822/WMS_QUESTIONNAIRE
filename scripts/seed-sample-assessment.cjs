require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Company = require('../netlify/functions/models/Company.js');
const User = require('../netlify/functions/models/User.js');
const Questionnaire = require('../netlify/functions/models/Questionnaire.js');
const Assessment = require('../netlify/functions/models/Assessment.js');

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
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    let sampleCompany = await Company.findOne({ name: '3PL Sample Company' });
    if (!sampleCompany) {
      sampleCompany = await Company.create({
        name: '3PL Sample Company',
        industry: 'Third-Party Logistics',
        size: 'large',
        address: { street: '123 Logistics Drive', city: 'Memphis', state: 'TN', country: 'USA', zipCode: '38103' },
        contact: { phone: '+1-555-0123', email: 'john.sample@3plsample.com' }
      });
    }

    const adminUser = await User.findOne({ email: 'admin@wmsquestion.com' });
    if (!adminUser) throw new Error('Admin user not found');

    const questionnaire = await Questionnaire.findOne({ title: 'Infor WMS Questionnaire' });
    if (!questionnaire) throw new Error('Questionnaire not found');

    const existingSample = await Assessment.findOne({ company: sampleCompany._id, isSample: true });
    if (existingSample) {
      await Assessment.deleteOne({ _id: existingSample._id });
    }

    const sampleAssessment = await Assessment.create({
      company: sampleCompany._id,
      questionnaire: questionnaire._id,
      user: adminUser._id,
      answers: sampleAnswers,
      status: 'completed',
      isSample: true,
      completedAt: new Date()
    });

    console.log('Sample assessment created with', sampleAnswers.length, 'answers');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seedSampleAssessment();