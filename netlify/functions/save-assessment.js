require('dotenv').config();
const { connectToDatabase } = require('./utils/db.js');
const Assessment = require('./models/Assessment.js');
const mongoose = require('mongoose');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    await connectToDatabase();
    const { questionnaireId, userId, companyId, answers, status } = JSON.parse(event.body);

    console.log('Save assessment request:', { questionnaireId, userId, companyId, answersCount: answers?.length, status });

    if (!questionnaireId || !userId || !companyId) {
      return { 
        statusCode: 400, 
        headers, 
        body: JSON.stringify({ error: 'Missing required fields', details: { questionnaireId, userId, companyId } }) 
      };
    }

    if (!mongoose.Types.ObjectId.isValid(questionnaireId) || !mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(companyId)) {
      return { 
        statusCode: 400, 
        headers, 
        body: JSON.stringify({ error: 'Invalid ObjectId format', details: { questionnaireId, userId, companyId } }) 
      };
    }

    let assessment = await Assessment.findOne({ 
      questionnaire: questionnaireId, 
      user: userId, 
      company: companyId 
    });

    if (assessment) {
      assessment.answers = answers;
      assessment.status = status || 'draft';
      if (status === 'completed' && !assessment.completedAt) {
        assessment.completedAt = new Date();
      }
      await assessment.save();
      console.log('Assessment updated:', assessment._id);
    } else {
      assessment = await Assessment.create({ 
        questionnaire: questionnaireId, 
        user: userId, 
        company: companyId, 
        answers, 
        status: status || 'draft' 
      });
      console.log('Assessment created:', assessment._id);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, assessmentId: assessment._id }) };
  } catch (error) {
    console.error('Save assessment error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message, stack: error.stack }) };
  }
};
