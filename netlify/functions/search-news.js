const axios = require('axios');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { 
      q, 
      language = 'en', 
      sortBy = 'publishedAt', 
      pageSize = 10, 
      from = '', 
      to = '' 
    } = event.queryStringParameters || {};
    
    if (!q) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter "q" is required' })
      };
    }

    const API_KEY = process.env.NEWS_API_KEY;
    if (!API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'NEWS_API_KEY not configured' })
      };
    }

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        apiKey: API_KEY,
        q,
        language,
        sortBy,
        pageSize,
        from,
        to
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}; 