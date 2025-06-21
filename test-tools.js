const { spawn } = require('child_process');
const readline = require('readline');

console.log('Available MCP Tools:');
console.log('1. get_top_headlines - Get top news headlines');
console.log('2. search_news - Search for specific news topics');
console.log('3. get_sources - Get available news sources');
console.log('');

console.log('To use these tools in Cursor:');
console.log('- Use "get_top_headlines" (not "get_news")');
console.log('- Parameters: country, category, pageSize, page');
console.log('');
console.log('Example parameters:');
console.log('- country: "us"');
console.log('- category: "technology"');
console.log('- pageSize: 5');
console.log('');

// Get API key from environment variable
const API_KEY = process.env.NEWS_API_KEY || 'your_api_key_here';

// Start the server for testing
const serverProcess = spawn('node', ['src/server.js'], {
  env: { ...process.env, NEWS_API_KEY: API_KEY }
});

serverProcess.stdout.on('data', (data) => {
  console.log('Server:', data.toString());
});

serverProcess.stderr.on('data', (data) => {
  console.error('Server Error:', data.toString());
});

// Keep the server running for 10 seconds
setTimeout(() => {
  serverProcess.kill();
  console.log('\nServer stopped. You can now connect to it from Cursor.');
}, 10000); 