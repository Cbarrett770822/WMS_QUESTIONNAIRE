require('dotenv').config();
const handler = require('./netlify/functions/get-assessments.js').handler;

async function test() {
  try {
    console.log('Testing get-assessments function...');
    const event = {
      httpMethod: 'GET',
      queryStringParameters: {}
    };
    
    const result = await handler(event);
    console.log('Status:', result.statusCode);
    console.log('Body:', result.body);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
  process.exit(0);
}

test();
