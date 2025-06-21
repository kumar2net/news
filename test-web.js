const express = require('express');
const { spawn } = require('child_process');
const axios = require('axios');
const app = express();
const port = 3001;

app.use(express.json());
app.use(express.static('public'));

// Get API key from environment variable
const API_KEY = process.env.NEWS_API_KEY || 'your_api_key_here';

// Start the MCP server
const mcpServer = spawn('node', ['src/server.js'], {
  env: { ...process.env, NEWS_API_KEY: API_KEY }
});

mcpServer.stdout.on('data', (data) => {
  console.log('MCP Server:', data.toString());
});

// Top headlines endpoint
app.get('/test-headlines', async (req, res) => {
  try {
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        apiKey: API_KEY,
        country: req.query.country || 'us',
        category: req.query.category || '',
        pageSize: req.query.pageSize || 10
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search news endpoint
app.get('/search-news', async (req, res) => {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        apiKey: API_KEY,
        q: req.query.q,
        language: req.query.language || 'en',
        sortBy: req.query.sortBy || 'publishedAt',
        pageSize: req.query.pageSize || 10,
        from: req.query.from || '',
        to: req.query.to || ''
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sources endpoint
app.get('/get-sources', async (req, res) => {
  try {
    const response = await axios.get('https://newsapi.org/v2/sources', {
      params: {
        apiKey: API_KEY,
        category: req.query.category || '',
        language: req.query.language || 'en',
        country: req.query.country || 'us'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Enhanced test server running at http://localhost:${port}`);
  console.log('Visit http://localhost:3001 to test the enhanced news API with drill-down features');
}); 