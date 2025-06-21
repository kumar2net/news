// Test script to verify environment variables
require('dotenv').config();

console.log('Environment Variable Test:');
console.log('NEWS_API_KEY:', process.env.NEWS_API_KEY ? '✅ Set' : '❌ Not set');
console.log('NEWS_API_BASE_URL:', process.env.NEWS_API_BASE_URL || 'Using default');
console.log('DEFAULT_COUNTRY:', process.env.DEFAULT_COUNTRY || 'Using default');

if (!process.env.NEWS_API_KEY) {
  console.log('\n❌ ERROR: NEWS_API_KEY is not set!');
  console.log('Please add it to your .env file or Netlify environment variables.');
} else {
  console.log('\n✅ NEWS_API_KEY is properly configured!');
} 