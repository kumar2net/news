// Vercel serverless function handler
const app = require('./index-newsdata');

module.exports = (req, res) => {
  req.url = '/api/get-sources' + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
  return app(req, res);
};
