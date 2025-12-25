const { anthropicMessages } = require('../netlify/functions/utils/anthropic.js');

const API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';

async function testKey() {
  console.log('Testing Anthropic API Key...\n');
  try {
    const response = await anthropicMessages({
      apiKey: API_KEY,
      model: 'claude-3-haiku-20240307',
      system: 'You are a helpful assistant.',
      user: 'Say hello',
      maxTokens: 50,
      timeoutMs: 30000
    });
    console.log('✅ SUCCESS! API Key works!\n');
    console.log('Response:', response);
  } catch (error) {
    console.error('❌ FAILED! API Key error:\n');
    console.error(error.message);
  }
}

testKey();
