const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const { getSampleArticles } = require("./sampleNewsData");
const { getSampleSources } = require("./sampleSourcesData");
const { getNewsDataClient } = require("./newsdata-io");

const app = express();
const port = process.env.PORT || 3000;

// API Keys
const newsApiKey = process.env.NEWSAPI_KEY || process.env.NEWS_API_KEY;
const newsDataApiKey = process.env.NEWSDATA_API_KEY;
const hasNewsApiKey = Boolean(newsApiKey);
const hasNewsDataKey = Boolean(newsDataApiKey);

// Configuration
const newsApiBaseUrl = process.env.NEWS_API_BASE_URL || "https://newsapi.org/v2";
const translationEndpoint = "https://translate.googleapis.com/translate_a/single";

// Determine which API to use (can be configured via env or query param)
const defaultNewsProvider = process.env.DEFAULT_NEWS_PROVIDER || "newsapi"; // 'newsapi' or 'newsdata'

const PERSIAN_CHAR_PATTERN = /[\u0600-\u06FF]/;
const translationCache = new Map();

app.use(cors());
app.use(express.json());

// Middleware to check if at least one API key is configured
const ensureApiKey = (req, res, next) => {
  if (!hasNewsApiKey && !hasNewsDataKey) {
    return res
      .status(500)
      .json({ error: "No news API key is configured on the server." });
  }
  return next();
};

// Translation functions (reused from original)
const hasPersianCharacters = (value) =>
  typeof value === "string" && PERSIAN_CHAR_PATTERN.test(value);

const translateTextToEnglish = async (text) => {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed.length) return null;

  if (translationCache.has(trimmed)) {
    return translationCache.get(trimmed);
  }

  try {
    const response = await axios.get(translationEndpoint, {
      params: {
        client: "gtx",
        sl: "auto",
        tl: "en",
        dt: "t",
        q: trimmed,
      },
    });

    const translated = Array.isArray(response.data?.[0])
      ? response.data[0]
          .map((segment) =>
            Array.isArray(segment) && typeof segment[0] === "string"
              ? segment[0]
              : "",
          )
          .join("")
          .trim()
      : null;

    translationCache.set(trimmed, translated || null);
    return translated || null;
  } catch (error) {
    console.warn("Failed to translate text", error.message);
    translationCache.set(trimmed, null);
    return null;
  }
};

const translateManyToEnglish = async (texts = []) => {
  if (!Array.isArray(texts) || !texts.length) {
    return [];
  }

  const translations = [];
  for (const value of texts) {
    // eslint-disable-next-line no-await-in-loop
    const translated = await translateTextToEnglish(value);
    translations.push(translated);
  }

  return translations;
};

/**
 * Unified news endpoint that can use either NewsAPI or NewsData.io
 * Query param 'provider' can override the default: ?provider=newsdata or ?provider=newsapi
 */
app.get("/api/news", async (req, res) => {
  const category =
    typeof req.query.category === "string" && req.query.category.trim().length > 0
      ? req.query.category.trim()
      : undefined;

  const countryParam =
    typeof req.query.country === "string" && req.query.country.trim().length > 0
      ? req.query.country.trim().toLowerCase()
      : "all";

  const languageParam =
    typeof req.query.language === "string" && req.query.language.trim().length > 0
      ? req.query.language.trim().toLowerCase()
      : undefined;

  // Determine which provider to use
  const provider = req.query.provider || defaultNewsProvider;

  // If no API keys are configured, return sample data
  if (!hasNewsApiKey && !hasNewsDataKey) {
    const demoArticles = getSampleArticles(countryParam === "all" ? "mixed" : countryParam);
    return res.json(demoArticles);
  }

  try {
    const requestedPageSize = Number.parseInt(req.query.pageSize, 10);
    const pageSize = Number.isFinite(requestedPageSize)
      ? Math.min(Math.max(requestedPageSize, 1), 100)
      : 50;

    let allArticles = [];

    // Use NewsData.io for better non-English coverage
    if (provider === "newsdata" && hasNewsDataKey) {
      console.log("Using NewsData.io API");
      const client = getNewsDataClient(newsDataApiKey);

      const params = {
        size: Math.min(pageSize, 50), // NewsData.io free tier max is 50
      };

      // Add country filter if specified (NewsData.io doesn't support 'all')
      if (countryParam && countryParam !== "all" && countryParam !== "undefined") {
        params.country = countryParam;
      }

      // Add language filter for non-English content
      if (languageParam && languageParam !== "undefined") {
        params.language = languageParam;
      }

      // Add category filter (avoid 'undefined' string)
      if (category && category !== "undefined") {
        params.category = category;
      }

      const result = await client.fetchLatestNews(params);
      allArticles = result.articles;

      // Add metadata for client
      res.set("X-News-Provider", "newsdata");
      res.set("X-Total-Results", result.totalResults);
      if (result.nextPage) {
        res.set("X-Next-Page", result.nextPage);
      }
    } 
    // Fallback to NewsAPI
    else if (hasNewsApiKey) {
      console.log("Using NewsAPI");
      res.set("X-News-Provider", "newsapi");

      if (countryParam === "all") {
        // For "all", fetch from multiple countries
        const topCountries = ["us", "gb", "in", "au", "ca"];
        const promises = topCountries.map(async (country) => {
          try {
            const response = await axios.get(`${newsApiBaseUrl}/top-headlines`, {
              params: {
                apiKey: newsApiKey,
                country,
                category,
                pageSize: Math.ceil(pageSize / topCountries.length),
              },
            });
            const articles = Array.isArray(response.data?.articles)
              ? response.data.articles
              : [];
            return articles.map((article) => ({ ...article, country }));
          } catch (err) {
            console.warn(`Failed to fetch news for ${country}:`, err.message);
            return [];
          }
        });

        const results = await Promise.all(promises);
        allArticles = results.flat();
      } else {
        // For specific country, use top-headlines endpoint
        const response = await axios.get(`${newsApiBaseUrl}/top-headlines`, {
          params: {
            apiKey: newsApiKey,
            country: countryParam,
            category,
            pageSize,
          },
        });
        allArticles = Array.isArray(response.data?.articles)
          ? response.data.articles.map((article) => ({ ...article, country: countryParam }))
          : [];
      }
    } else {
      return res.status(503).json({
        error: "No news API available",
        details: "Neither NewsAPI nor NewsData.io is configured",
      });
    }

    // Format articles for consistent response
    const formatted = allArticles
      .filter((article) => article && article.url && article.title)
      .map((article) => ({
        title: article.title,
        description: article.description ?? null,
        url: article.url,
        urlToImage: article.urlToImage ?? null,
        publishedAt: article.publishedAt ?? null,
        source: { name: article.source?.name ?? "Unknown source" },
        country: article.country ?? null,
        language: article.language ?? null,
        category: article.category ?? null,
        keywords: article.keywords ?? null,
        author: article.author ?? null,
      }));

    res.json(formatted);
  } catch (error) {
    console.error("Failed to fetch news", error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      error: "Unable to fetch news articles",
      details: error.response?.data || error.message,
    });
  }
});

// Search endpoint with provider selection
app.get("/api/search-news", ensureApiKey, async (req, res) => {
  if (!req.query.q) {
    return res
      .status(400)
      .json({ error: "Missing required query parameter: q" });
  }

  const provider = req.query.provider || defaultNewsProvider;

  try {
    // Use NewsData.io for better multilingual search
    if (provider === "newsdata" && hasNewsDataKey) {
      console.log("Searching with NewsData.io");
      const client = getNewsDataClient(newsDataApiKey);

      const params = {
        q: req.query.q,
        size: Math.min(Number(req.query.pageSize) || 20, 50),
      };

      // Only add optional params if they're valid
      if (req.query.language && req.query.language !== "undefined" && req.query.language !== "all") {
        params.language = req.query.language;
      }
      if (req.query.country && req.query.country !== "undefined" && req.query.country !== "all") {
        params.country = req.query.country;
      }
      if (req.query.category && req.query.category !== "undefined") {
        params.category = req.query.category;
      }

      const result = await client.fetchNews(params);
      
      res.set("X-News-Provider", "newsdata");
      res.json({
        status: "ok",
        totalResults: result.totalResults,
        articles: result.articles,
        nextPage: result.nextPage,
      });
    }
    // Fallback to NewsAPI
    else if (hasNewsApiKey) {
      console.log("Searching with NewsAPI");
      const response = await axios.get(`${newsApiBaseUrl}/everything`, {
        params: {
          apiKey: newsApiKey,
          q: req.query.q,
          language: req.query.language || process.env.DEFAULT_LANGUAGE || "en",
          sortBy: req.query.sortBy || "publishedAt",
          pageSize: req.query.pageSize || process.env.DEFAULT_PAGE_SIZE || 20,
          page: req.query.page || 1,
          from: req.query.from,
          to: req.query.to,
        },
      });
      
      res.set("X-News-Provider", "newsapi");
      res.json(response.data);
    } else {
      res.status(503).json({
        error: "No search API available",
      });
    }
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({
      error: "Failed to search news",
      details: error.response?.data || error.message,
    });
  }
});

// Keep existing NewsAPI endpoints for backward compatibility
app.get("/api/top-headlines", async (req, res) => {
  if (!hasNewsApiKey) {
    return res.status(503).json({ error: "NewsAPI key not configured" });
  }

  try {
    const response = await axios.get(`${newsApiBaseUrl}/top-headlines`, {
      params: {
        apiKey: newsApiKey,
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

app.get("/api/get-sources", async (req, res) => {
  const countryParam =
    typeof req.query.country === "string" && req.query.country.trim().length
      ? req.query.country.trim().toLowerCase()
      : process.env.DEFAULT_COUNTRY || "us";

  if (!hasNewsApiKey && !hasNewsDataKey) {
    const samples = getSampleSources(countryParam);
    return res.json({ sources: samples });
  }

  try {
    // Try NewsAPI sources endpoint
    if (hasNewsApiKey) {
      const params = {
        apiKey: newsApiKey,
        category: req.query.category,
        country: countryParam,
      };

      const requestedLanguage =
        typeof req.query.language === "string" ? req.query.language.trim() : "";

      if (requestedLanguage && requestedLanguage.toLowerCase() !== "all") {
        params.language = requestedLanguage;
      }

      const response = await axios.get(`${newsApiBaseUrl}/sources`, {
        params,
      });
      res.json(response.data);
    } else {
      res.status(503).json({ error: "Sources API not available" });
    }
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({
      error: "Failed to fetch sources",
      details: error.response?.data || error.message,
    });
  }
});

// Translation endpoint
app.post("/api/translate", async (req, res) => {
  const texts = Array.isArray(req.body?.texts)
    ? req.body.texts.filter((value) => typeof value === "string")
    : [];

  if (!texts.length) {
    return res.status(400).json({ error: "Request must include texts array" });
  }

  try {
    const translations = await translateManyToEnglish(texts);
    res.json({ translations });
  } catch (error) {
    res.status(500).json({
      error: "Failed to translate content",
      details: error.message,
    });
  }
});

// Health check with API status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    apis: {
      newsapi: hasNewsApiKey,
      newsdata: hasNewsDataKey,
    },
    defaultProvider: defaultNewsProvider,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
  console.log(`NewsAPI: ${hasNewsApiKey ? "✓" : "✗"}`);
  console.log(`NewsData.io: ${hasNewsDataKey ? "✓" : "✗"}`);
  console.log(`Default provider: ${defaultNewsProvider}`);
});
