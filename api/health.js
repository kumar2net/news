// Vercel serverless function handler
const app = require('./index-newsdata');

// Export handler for Vercel
module.exports = (req, res) => {
  // Set the path for Express routing
  req.url = '/api/health';
  return app(req, res);
};
