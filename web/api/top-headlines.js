import axios from 'axios';

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

export default async function handler(req, res) {
  Object.entries(HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const {
    country = 'us',
    category = '',
    pageSize = 10,
  } = req.query;

  const apiKey = process.env.NEWS_API_KEY || process.env.VITE_NEWS_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'NEWS_API_KEY not configured' });
    return;
  }

  try {
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        apiKey,
        country,
        category,
        pageSize,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json({ error: error.message || 'Failed to fetch top headlines' });
  }
}
