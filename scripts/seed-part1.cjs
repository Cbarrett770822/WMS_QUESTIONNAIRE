require('dotenv').config();
const mongoose = require('mongoose');
const Questionnaire = require('../netlify/functions/models/Questionnaire.js');

const sections = [
  {
    title: 'Executive Summary & Value Discovery',
    description: 'Understanding pain points and value drivers',
    order: 0,
    questions: [
      { id: 'exec_1', text: 'What are your top 3 business challenges related to warehouse operations?', type: 'text', required: true, order: 1 },
      { id: 'exec_2', text: 'What are your current annual warehouse operational costs?', type: 'text', required: true, order: 2 },
      { id: 'exec_3', text: 'What is your inventory carrying cost as % of inventory value?', type: 'text', required: true, order: 3 },
      { id: 'exec_4', text: 'What is your current cost per order?', type: 'text', required: true, order: 4 },
      { id: 'exec_5', text: 'What is your current OTIF (On Time In Full) score %?', type: 'text', required: true, order: 5 },
      { id: 'exec_6', text: 'What is your current order fulfillment accuracy rate?', type: 'text', required: true, order: 6 },
      { id: 'exec_7', text: 'What is your current inventory accuracy level (%)?', type: 'text', required: true, order: 7 },
      { id: 'exec_8', text: 'What is your current returns rate (%)?', type: 'text', required: true, order: 8 },
      { id: 'exec_9', text: 'How many channels do you operate? (B2B, B2C, B2B2C)', type: 'text', required: true, order: 9 },
      { id: 'exec_10', text: 'What is your annual IT spend on warehouse/logistics systems?', type: 'text', required: false, order: 10 },
      { id: 'exec_11', text: 'What is the estimated value of write-off/scrap/damage annually?', type: 'text', required: false, order: 11 },
      { id: 'exec_12', text: 'What is your warehouse capacity utilization %?', type: 'text', required: true, order: 12 }
    ]
  },
  {
    title: 'Objective & Pain Points',
    description: 'Business overview and key challenges',
    order: 1,
    questions: [
      { id: 'obj_1', text: 'Provide a high level overview of your business', type: 'text', required: true, order: 1 },
      { id: 'obj_2', text: 'What are your major pains and challenges?', type: 'text', required: true, order: 2 },
      { id: 'obj_3', text: 'Is this a digitalization project?', type: 'boolean', required: true, order: 3 },
      { id: 'obj_4', text: 'Is the organization ready for cloud?', type: 'boolean', required: true, order: 4 },
      { id: 'obj_5', text: 'Status of Project, Timeline, Key Events', type: 'text', required: true, order: 5 },
      { id: 'obj_6', text: 'Is your operation high touch or low touch?', type: 'text', required: true, order: 6 },
      { id: 'obj_7', text: 'What are your top 3 operational inefficiencies?', type: 'text', required: true, order: 7 }
    ]
  }
];

const comprehensiveQuestionnaire = {
  title: 'Infor WMS Questionnaire',
  description: 'Comprehensive WMS discovery and requirements assessment',
  version: '2.0',
  isActive: true,
  sections: sections
};

async function seedQuestionnaire() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    await Questionnaire.deleteMany({ title: 'Infor WMS Questionnaire' });
    const q = await Questionnaire.create(comprehensiveQuestionnaire);
    console.log('Created questionnaire with', q.sections.length, 'sections');
    let total = 0;
    q.sections.forEach(s => { total += s.questions.length; });
    console.log('Total questions:', total);
    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedQuestionnaire();
