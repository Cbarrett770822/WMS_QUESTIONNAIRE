require('dotenv').config();
const { connectToDatabase } = require('./utils/db.js');
const Assessment = require('./models/Assessment.js');
const Questionnaire = require('./models/Questionnaire.js');
const User = require('./models/User.js');
const Company = require('./models/Company.js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    await connectToDatabase();
    const { companyId, userId, assessmentId } = event.queryStringParameters || {};

    let query = {};
    if (assessmentId) query._id = assessmentId;
    else {
      if (companyId) query.company = companyId;
      if (userId) query.user = userId;
    }

    const assessments = await Assessment.find(query)
      .populate('questionnaire', 'title description')
      .populate('user', 'name email')
      .populate('company', 'name')
      .sort({ createdAt: -1 });

    return { statusCode: 200, headers, body: JSON.stringify(assessments) };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
