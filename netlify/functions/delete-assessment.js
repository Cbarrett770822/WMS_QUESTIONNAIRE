require('dotenv').config();
const { connectToDatabase } = require('./utils/db.js');
const Assessment = require('./models/Assessment.js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    await connectToDatabase();
    
    const { assessmentId } = event.queryStringParameters || {};
    
    if (!assessmentId) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Assessment ID required' }) };
    }

    // Check if assessment is a sample
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Assessment not found' }) };
    }

    if (assessment.isSample) {
      return { 
        statusCode: 403, 
        headers, 
        body: JSON.stringify({ error: 'Cannot delete sample assessment' }) 
      };
    }

    await Assessment.findByIdAndDelete(assessmentId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Assessment deleted' })
    };
  } catch (error) {
    console.error('Delete assessment error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
