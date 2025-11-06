const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const { getSampleArticles } = require("./sampleNewsData");
const { getSampleSources } = require("./sampleSourcesData");

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "..", "public");
const hasBuiltClient = fs.existsSync(path.join(publicDir, "index.html"));
const isServerless = Boolean(process.env.VERCEL);

const apiKey = process.env.NEWSAPI_KEY || process.env.NEWS_API_KEY;
const hasApiKey = Boolean(apiKey);
const baseUrl = process.env.NEWS_API_BASE_URL || "https://newsapi.org/v2";
const translationEndpoint =
  "https://translate.googleapis.com/translate_a/single";

const PERSIAN_CHAR_PATTERN = /[\u0600-\u06FF]/;
const translationCache = new Map();

app.use(cors());
app.use(express.json());

const ensureApiKey = (req, res, next) => {
  if (!hasApiKey) {
    return res
      .status(500)
      .json({ error: "NEWS_API_KEY is not configured on the server." });
  }
  return next();
};

const fetchSources = async (params = {}) => {
  const response = await axios.get(`${baseUrl}/sources`, {
    params: {
      apiKey,
      ...params,
    },
  });
  return Array.isArray(response.data?.sources) ? response.data.sources : [];
};

const fetchArticles = async (params = {}) => {
  const response = await axios.get(`${baseUrl}/everything`, {
    params: {
      apiKey,
      sortBy: "publishedAt",
      pageSize: 20,
      ...params,
    },
  });
  return Array.isArray(response.data?.articles) ? response.data.articles : [];
};

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

app.get("/api/news", async (req, res) => {
  const category =
    typeof req.query.category === "string" && req.query.category.trim().length > 0
      ? req.query.category.trim()
      : undefined;

  const countryParam =
    typeof req.query.country === "string" && req.query.country.trim().length > 0
      ? req.query.country.trim().toLowerCase()
      : "all";

  if (!hasApiKey) {
    const demoArticles = getSampleArticles(countryParam === "all" ? "mixed" : countryParam);
    return res.json(demoArticles);
  }

  try {
    const requestedPageSize = Number.parseInt(req.query.pageSize, 10);
    const pageSize = Number.isFinite(requestedPageSize)
      ? Math.min(Math.max(requestedPageSize, 1), 100)
      : 50;

    let allArticles = [];

    if (countryParam === "all") {
      // For "all", fetch from multiple countries
      const topCountries = ["us", "gb", "in", "au", "ca"];
      const promises = topCountries.map(async (country) => {
        try {
          const response = await axios.get(`${baseUrl}/top-headlines`, {
            params: {
              apiKey,
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
      const response = await axios.get(`${baseUrl}/top-headlines`, {
        params: {
          apiKey,
          country: countryParam,
          category,
          pageSize,
        },
      });
      allArticles = Array.isArray(response.data?.articles)
        ? response.data.articles.map((article) => ({ ...article, country: countryParam }))
        : [];
    }

    const formatted = allArticles
      .filter((article) => article && article.url && article.title)
      .map((article) => ({
        title: article.title,
        description: article.description ?? null,
        url: article.url,
        source: { name: article.source?.name ?? "Unknown source" },
        country: article.country ?? null,
      }));

    res.json(formatted);
  } catch (error) {
    console.error("Failed to fetch curated news", error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      error: "Unable to fetch news articles",
      details: error.response?.data || error.message,
    });
  }
});

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

app.get("/api/get-sources", async (req, res) => {
  const countryParam =
    typeof req.query.country === "string" && req.query.country.trim().length
      ? req.query.country.trim().toLowerCase()
      : process.env.DEFAULT_COUNTRY || "us";

  if (!hasApiKey) {
    const samples = getSampleSources(countryParam);
    return res.json({ sources: samples });
  }

  try {
    const params = {
      apiKey,
      category: req.query.category,
      country: countryParam,
    };

    const requestedLanguage =
      typeof req.query.language === "string" ? req.query.language.trim() : "";

    if (requestedLanguage && requestedLanguage.toLowerCase() !== "all") {
      params.language = requestedLanguage;
    }

    const response = await axios.get(`${baseUrl}/sources`, {
      params,
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

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
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

if (!isServerless) {
  app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });
}

module.exports = app;
