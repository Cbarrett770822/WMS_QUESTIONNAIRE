require('dotenv').config();
const { connectToDatabase } = require('./utils/db.js');
const Company = require('./models/Company.js');

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
    const { name } = JSON.parse(event.body);

    if (!name || !name.trim()) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Company name required' }) };
    }

    const company = await Company.create({ name: name.trim() });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(company)
    };
  } catch (error) {
    console.error('Create company error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
