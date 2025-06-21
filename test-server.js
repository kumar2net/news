const { spawn } = require('child_process');
const path = require('path');

// Test the MCP server by spawning it and sending a simple request
const serverProcess = spawn('node', ['src/server.js'], {
  cwd: __dirname,
  env: { ...process.env, NEWS_API_KEY: 'test-key' }
});

let output = '';
let errorOutput = '';

serverProcess.stdout.on('data', (data) => {
  output += data.toString();
  console.log('Server output:', data.toString());
});

serverProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.error('Server error:', data.toString());
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  console.log('Final output:', output);
  console.log('Final error:', errorOutput);
});

// Kill the server after 5 seconds
setTimeout(() => {
  serverProcess.kill();
}, 5000); 