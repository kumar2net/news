const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const { getSampleArticles } = require("./sampleNewsData");
const { getSampleSources } = require("./sampleSourcesData");

const app = express();
const port = process.env.PORT || 3000;

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
      language: "en",
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
  const topic =
    typeof req.query.topic === "string" && req.query.topic.trim().length > 0
      ? req.query.topic.trim()
      : "politics";

  const originParam =
    typeof req.query.originCountry === "string"
      ? req.query.originCountry.toLowerCase()
      : "mixed";

  const originCountry = ["ir", "global", "mixed"].includes(originParam)
    ? originParam
    : "mixed";

  if (!hasApiKey) {
    const demoArticles = getSampleArticles(originCountry);
    return res.json(demoArticles);
  }

  try {
    let sourceMetadata = new Map();
    let sourceIds = [];
    const requestedPageSize = Number.parseInt(req.query.pageSize, 10);
    const pageSize = Number.isFinite(requestedPageSize)
      ? Math.min(Math.max(requestedPageSize, 1), 50)
      : undefined;

    if (originCountry === "ir" || originCountry === "global") {
      const allSources = await fetchSources();
      const filteredSources = allSources.filter((source) => {
        if (!source || !source.country) return false;
        return originCountry === "ir"
          ? source.country.toLowerCase() === "ir"
          : source.country.toLowerCase() !== "ir";
      });

      filteredSources.forEach((source) => {
        if (source.id) {
          sourceIds.push(source.id);
          sourceMetadata.set(source.id, source.country?.toLowerCase() ?? null);
        }
      });

      if (!sourceIds.length) {
        return res.json([]);
      }
    } else {
      const allSources = await fetchSources();
      allSources.forEach((source) => {
        if (source?.id) {
          sourceMetadata.set(source.id, source.country?.toLowerCase() ?? null);
        }
      });
    }

    const params = {
      q: topic,
      ...(pageSize ? { pageSize } : {}),
    };

    if (sourceIds.length) {
      params.sources = sourceIds.slice(0, 20).join(",");
    }

    const articles = await fetchArticles(params);

    let formatted = articles
      .filter((article) => article && article.url && article.title)
      .map((article) => {
        const sourceId = article.source?.id ?? null;
        const countryCode = sourceId ? sourceMetadata.get(sourceId) : null;
        let originTag = null;

        if (countryCode) {
          originTag = countryCode === "ir" ? "ir" : "global";
        } else if (originCountry === "ir" || originCountry === "global") {
          originTag = originCountry;
        }

        return {
          title: article.title,
          description: article.description ?? null,
          url: article.url,
          source: { name: article.source?.name ?? "Unknown source" },
          country: countryCode ?? null,
          origin: originTag,
        };
      });

    if (originCountry === "mixed" && formatted.length) {
      formatted = await Promise.all(
        formatted.map(async (article) => {
          const enTranslations = {};

          if (hasPersianCharacters(article.title)) {
            const translatedTitle = await translateTextToEnglish(article.title);
            if (translatedTitle && translatedTitle !== article.title) {
              enTranslations.title = translatedTitle;
            }
          }

          if (hasPersianCharacters(article.description)) {
            const translatedDescription = await translateTextToEnglish(
              article.description,
            );
            if (
              translatedDescription &&
              translatedDescription !== article.description
            ) {
              enTranslations.description = translatedDescription;
            }
          }

          if (Object.keys(enTranslations).length === 0) {
            return article;
          }

          return {
            ...article,
            translations: {
              ...article.translations,
              en: {
                ...(article.translations?.en ?? {}),
                ...enTranslations,
              },
            },
          };
        }),
      );
    }

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

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
