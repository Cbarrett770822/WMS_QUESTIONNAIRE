require('dotenv').config();
const handler = require('./netlify/functions/get-assessments.js').handler;

async function test() {
  try {
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {}
    };
    
    const result = await handler(event);
    console.log('Status:', result.statusCode);
    console.log('Body:', result.body);
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

test();
