const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.NEWS_API_KEY;
const baseUrl = process.env.NEWS_API_BASE_URL || "https://newsapi.org/v2";

app.use(cors());
app.use(express.json());

const ensureApiKey = (req, res, next) => {
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "NEWS_API_KEY is not configured on the server." });
  }
  return next();
};

app.get("/api/top-headlines", ensureApiKey, async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/top-headlines`, {
      params: {
        apiKey,
        country: req.query.country || process.env.DEFAULT_COUNTRY || "us",
        category: req.query.category,
        pageSize: req.query.pageSize || process.env.DEFAULT_PAGE_SIZE || 20,
        page: req.query.page || 1,
      },
    });
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({
      error: "Failed to fetch top headlines",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/api/search-news", ensureApiKey, async (req, res) => {
  if (!req.query.q) {
    return res
      .status(400)
      .json({ error: "Missing required query parameter: q" });
  }

  try {
    const response = await axios.get(`${baseUrl}/everything`, {
      params: {
        apiKey,
        q: req.query.q,
        language: req.query.language || process.env.DEFAULT_LANGUAGE || "en",
        sortBy: req.query.sortBy || "publishedAt",
        pageSize: req.query.pageSize || process.env.DEFAULT_PAGE_SIZE || 20,
        page: req.query.page || 1,
        from: req.query.from,
        to: req.query.to,
      },
    });
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({
      error: "Failed to search news",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/api/get-sources", ensureApiKey, async (req, res) => {
  try {
    const response = await axios.get(`${baseUrl}/sources`, {
      params: {
        apiKey,
        category: req.query.category,
        language: req.query.language || process.env.DEFAULT_LANGUAGE || "en",
        country: req.query.country || process.env.DEFAULT_COUNTRY || "us",
      },
    });
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({
      error: "Failed to fetch sources",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
