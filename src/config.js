const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from a .env file if present.
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const ensureUrl = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  try {
    return new URL(value).toString();
  } catch (error) {
    console.warn(
      `Invalid NEWS_API_BASE_URL provided (\"${value}\"). Falling back to default.`,
    );
    return fallback;
  }
};

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseConfig = () => {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error("NEWS_API_KEY environment variable is required");
  }

  return {
    NEWS_API_KEY: apiKey,
    NEWS_API_BASE_URL: ensureUrl(
      process.env.NEWS_API_BASE_URL,
      "https://newsapi.org/v2",
    ),
    DEFAULT_COUNTRY: process.env.DEFAULT_COUNTRY || "us",
    DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE || "en",
    DEFAULT_PAGE_SIZE: parsePositiveInteger(process.env.DEFAULT_PAGE_SIZE, 20),
  };
};

module.exports = { parseConfig };
