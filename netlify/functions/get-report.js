require('dotenv').config();
const { connectToDatabase } = require('./utils/db.js');
const Report = require('./models/Report.js');
const Company = require('./models/Company.js');
const Assessment = require('./models/Assessment.js');
const User = require('./models/User.js');

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
    const { reportId, assessmentId } = event.queryStringParameters || {};

    let query = {};
    if (reportId) query._id = reportId;
    if (assessmentId) query.assessmentId = assessmentId;

    const report = await Report.findOne(query)
      .populate('companyId', 'name')
      .populate('assessmentId')
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 });

    if (!report) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Report not found' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(report) };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
