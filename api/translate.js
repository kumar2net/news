// Vercel serverless function handler
const app = require('./index-newsdata');

module.exports = (req, res) => {
  req.url = '/api/translate' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
  return app(req, res);
};
