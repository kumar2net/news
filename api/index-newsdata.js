const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const { getSampleArticles } = require("./sampleNewsData");
const { getSampleSources } = require("./sampleSourcesData");
const { getNewsDataClient } = require("./newsdata-io");

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "..", "public");
const hasBuiltClient = fs.existsSync(path.join(publicDir, "index.html"));
const isServerless = Boolean(process.env.VERCEL);

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

// Simple in-memory cache for sources to reduce upstream rate-limit hits
const sourcesCache = new Map(); // key -> { data, cachedAt }
const SOURCES_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

const getCachedSources = (key) => {
  const entry = sourcesCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > SOURCES_TTL_MS) {
    sourcesCache.delete(key);
    return null;
  }
  return entry.data;
};

const setCachedSources = (key, data) => {
  sourcesCache.set(key, { data, cachedAt: Date.now() });
};

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
        size: Math.min(pageSize, 10), // NewsData.io free tier max is 10
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

      try {
        const result = await client.fetchLatestNews(params);
        allArticles = result.articles;

        // Add metadata for client
        res.set("X-News-Provider", "newsdata");
        res.set("X-Total-Results", result.totalResults);
        if (result.nextPage) {
          res.set("X-Next-Page", result.nextPage);
        }
      } catch (err) {
        const status = err.response?.status;
        // If NewsData.io is rate limited, transparently fall back to NewsAPI when available
        if (status === 429 && hasNewsApiKey) {
          console.warn("NewsData.io returned 429; falling back to NewsAPI");
          res.set("X-News-Fallback", "newsapi");
          // Execute the same NewsAPI logic as below (duplicated locally to keep flow simple)
          res.set("X-News-Provider", "newsapi");
          if (countryParam === "all") {
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
              } catch (e) {
                console.warn(`Failed to fetch news for ${country}:`, e.message);
                return [];
              }
            });
            const results = await Promise.all(promises);
            allArticles = results.flat();
          } else {
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
          throw err;
        }
      }
    } 
    // Fallback to NewsAPI
    else if (hasNewsApiKey) {
      console.log("Using NewsAPI");
      res.set("X-News-Provider", "newsapi");

      try {
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
      } catch (err) {
        const status = err.response?.status;
        if (status === 429 && hasNewsDataKey) {
          console.warn("NewsAPI returned 429; falling back to NewsData.io");
          res.set("X-News-Fallback", "newsdata");
          const client = getNewsDataClient(newsDataApiKey);
          const params = {
            size: Math.min(pageSize, 10),
          };
          if (countryParam && countryParam !== "all" && countryParam !== "undefined") {
            params.country = countryParam;
          }
          if (languageParam && languageParam !== "undefined") {
            params.language = languageParam;
          }
          if (category && category !== "undefined") {
            params.category = category;
          }
          const result = await client.fetchLatestNews(params);
          allArticles = result.articles;
          res.set("X-News-Provider", "newsdata");
          res.set("X-Total-Results", result.totalResults);
          if (result.nextPage) {
            res.set("X-Next-Page", result.nextPage);
          }
        } else {
          throw err;
        }
      }
    } else {
      return res.status(503).json({
        error: "No news API available",
        details: "Neither NewsAPI nor NewsData.io is configured",
      });
    }

    // Format articles for consistent response
    const formatted = await Promise.all(
      allArticles
        .filter((article) => article && article.url && article.title)
        .map(async (article) => {
          const art = {
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
          };

          if (
            art.language &&
            art.language !== "en" &&
            art.description
          ) {
            const translated = await translateTextToEnglish(art.description);
            if (translated) {
              art.description = `${art.description}<br/><hr/><b>Translated:</b><br/>${translated}`;
            }
          }
          return art;
        }),
    );

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
        size: Math.min(Number(req.query.pageSize) || 20, 10),
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

      try {
        const result = await client.fetchNews(params);
        res.set("X-News-Provider", "newsdata");
        res.json({
          status: "ok",
          totalResults: result.totalResults,
          articles: result.articles,
          nextPage: result.nextPage,
        });
      } catch (err) {
        const status = err.response?.status;
        if (status === 429 && hasNewsApiKey) {
          console.warn("NewsData.io search returned 429; falling back to NewsAPI");
          res.set("X-News-Fallback", "newsapi");
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
          throw err;
        }
      }
    }
    // Fallback to NewsAPI
    else if (hasNewsApiKey) {
      console.log("Searching with NewsAPI");
      try {
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
      } catch (err) {
        const status = err.response?.status;
        if (status === 429 && hasNewsDataKey) {
          console.warn("NewsAPI search returned 429; falling back to NewsData.io");
          res.set("X-News-Fallback", "newsdata");
          const client = getNewsDataClient(newsDataApiKey);
          const params = {
            q: req.query.q,
            size: Math.min(Number(req.query.pageSize) || 20, 10),
          };
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
        } else {
          throw err;
        }
      }
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

  // If no upstream keys at all, return samples
  if (!hasNewsApiKey && !hasNewsDataKey) {
    const samples = getSampleSources(countryParam);
    return res.json({ sources: samples });
  }

  // Build a cache key based on filters
  const requestedLanguage =
    typeof req.query.language === "string" ? req.query.language.trim() : "";
  const normalizedLanguage =
    requestedLanguage && requestedLanguage.toLowerCase() !== "all"
      ? requestedLanguage
      : ""; // empty means "all"
  const categoryParam = typeof req.query.category === "string" ? req.query.category.trim() : "";
  const cacheKey = `sources|country=${countryParam}|lang=${normalizedLanguage}|cat=${categoryParam}`;

  // Serve from cache if available
  const cached = getCachedSources(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    // For now, NewsAPI is the only upstream for sources in this server
    if (hasNewsApiKey) {
      const params = {
        apiKey: newsApiKey,
        category: categoryParam || undefined,
        country: countryParam,
      };

      if (normalizedLanguage) {
        params.language = normalizedLanguage;
      }

      const response = await axios.get(`${newsApiBaseUrl}/sources`, { params });
      const payload = response.data;
      // Cache successful responses to avoid repeated upstream calls
      if (payload && Array.isArray(payload.sources)) {
        setCachedSources(cacheKey, payload);
      }
      return res.json(payload);
    }

    // If NewsAPI key is missing but NewsData key exists, respond with a helpful message
    return res.status(503).json({ error: "Sources API not available for current provider" });
  } catch (error) {
    const status = error.response?.status || 500;
    // Forward rate-limit hints if present
    const retryAfter = error.response?.headers?.["retry-after"];
    if (retryAfter) {
      res.set("Retry-After", String(retryAfter));
    }

    // For 429, return a friendlier error message
    if (status === 429) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        details: "The upstream NewsAPI /sources endpoint returned 429 (Too Many Requests). Please wait and try again, or reduce request frequency.",
      });
    }

    return res.status(status).json({
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

if (hasBuiltClient) {
  app.use(express.static(publicDir));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }

    if (req.method !== "GET") {
      return next();
    }

    if (path.extname(req.path)) {
      return next();
    }

    const accepts = req.headers.accept || "";
    if (!accepts.includes("text/html")) {
      return next();
    }

    return res.sendFile(path.join(publicDir, "index.html"));
  });
}

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.status(404).send("Not found");
});

// For local development
const handler = (req, res) => app(req, res);

if (!isServerless) {
  // Start server with a small retry when the desired port is already in use.
  // This prevents an unhandled 'error' crash when port 3000 is occupied.
  const startServer = (startPort, maxRetries = 5) => {
    let attempts = 0;

    const tryListen = (p) => {
      const server = app.listen(p, () => {
        console.log(`API server listening on http://localhost:${p}`);
        console.log(`NewsAPI: ${hasNewsApiKey ? "✓" : "✗"}`);
        console.log(`NewsData.io: ${hasNewsDataKey ? "✓" : "✗"}`);
        console.log(`Default provider: ${defaultNewsProvider}`);
      });

      server.on("error", (err) => {
        if (err && err.code === "EADDRINUSE" && attempts < maxRetries) {
          attempts += 1;
          const nextPort = Number(p) + 1;
          console.warn(
            `Port ${p} in use, trying port ${nextPort} (attempt ${attempts}/${maxRetries})...`,
          );
          // small delay before retrying to avoid tight loop
          setTimeout(() => tryListen(nextPort), 200);
        } else {
          console.error("Failed to start server:", err && err.message ? err.message : err);
          process.exit(1);
        }
      });
    };

    tryListen(Number(startPort) || 3000);
  };

  startServer(port, 5);
}

// Export for Vercel serverless
module.exports = handler;
module.exports.app = app;
