#!/usr/bin/env node

/**
 * Compare NewsAPI vs NewsData.io side by side
 * 
 * Usage:
 *   node compare-apis.js [language]
 * 
 * Examples:
 *   node compare-apis.js ar    # Compare Arabic coverage
 *   node compare-apis.js hi    # Compare Hindi coverage
 *   node compare-apis.js en    # Compare English coverage
 */

require("dotenv").config();
const axios = require("axios");
const { getNewsDataClient } = require("./api/newsdata-io");

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

const language = process.argv[2] || "en";

const log = {
  success: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  info: (msg) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
  warning: (msg) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
  section: (msg) => console.log(`\n${COLORS.cyan}${msg}${COLORS.reset}`),
  highlight: (msg) => console.log(`${COLORS.magenta}${msg}${COLORS.reset}`),
};

async function compareAPIs() {
  const newsApiKey = process.env.NEWSAPI_KEY || process.env.NEWS_API_KEY;
  const newsDataKey = process.env.NEWSDATA_API_KEY;

  log.section("=".repeat(70));
  log.section(`Comparing News APIs for Language: ${language.toUpperCase()}`);
  log.section("=".repeat(70));

  // Check API keys
  if (!newsApiKey && !newsDataKey) {
    log.error("No API keys configured!");
    log.info("Set NEWSAPI_KEY and/or NEWSDATA_API_KEY in .env");
    process.exit(1);
  }

  const results = {
    newsapi: null,
    newsdata: null,
  };

  // Test NewsAPI
  if (newsApiKey) {
    log.section("\n📰 Testing NewsAPI...");
    try {
      const response = await axios.get("https://newsapi.org/v2/everything", {
        params: {
          apiKey: newsApiKey,
          language,
          pageSize: 10,
          sortBy: "publishedAt",
        },
      });

      results.newsapi = {
        count: response.data.articles?.length || 0,
        totalResults: response.data.totalResults || 0,
        articles: response.data.articles || [],
        error: null,
      };

      log.success(`Found ${results.newsapi.totalResults} total articles`);
      log.info(`Retrieved ${results.newsapi.count} articles`);
    } catch (error) {
      results.newsapi = {
        count: 0,
        totalResults: 0,
        articles: [],
        error: error.response?.data?.message || error.message,
      };
      log.error(`Failed: ${results.newsapi.error}`);
    }
  } else {
    log.warning("NewsAPI key not configured - skipping");
  }

  // Test NewsData.io
  if (newsDataKey) {
    log.section("\n📡 Testing NewsData.io...");
    try {
      const client = getNewsDataClient(newsDataKey);
      const result = await client.fetchLatestNews({
        language,
        size: 10,
      });

      results.newsdata = {
        count: result.articles.length,
        totalResults: result.totalResults,
        articles: result.articles,
        error: null,
      };

      log.success(`Found ${results.newsdata.totalResults} total articles`);
      log.info(`Retrieved ${results.newsdata.count} articles`);
    } catch (error) {
      results.newsdata = {
        count: 0,
        totalResults: 0,
        articles: [],
        error: error.response?.data?.message || error.message,
      };
      log.error(`Failed: ${results.newsdata.error}`);
    }
  } else {
    log.warning("NewsData.io key not configured - skipping");
  }

  // Comparison Summary
  log.section("\n" + "=".repeat(70));
  log.section("COMPARISON SUMMARY");
  log.section("=".repeat(70));

  console.log("\n┌─────────────────────┬──────────────┬──────────────┐");
  console.log("│ Metric              │ NewsAPI      │ NewsData.io  │");
  console.log("├─────────────────────┼──────────────┼──────────────┤");
  
  const newsApiCount = results.newsapi?.count || 0;
  const newsDataCount = results.newsdata?.count || 0;
  console.log(`│ Articles Retrieved  │ ${String(newsApiCount).padEnd(12)} │ ${String(newsDataCount).padEnd(12)} │`);
  
  const newsApiTotal = results.newsapi?.totalResults || 0;
  const newsDataTotal = results.newsdata?.totalResults || 0;
  console.log(`│ Total Available     │ ${String(newsApiTotal).padEnd(12)} │ ${String(newsDataTotal).padEnd(12)} │`);
  
  const newsApiStatus = results.newsapi?.error ? "❌" : "✅";
  const newsDataStatus = results.newsdata?.error ? "❌" : "✅";
  console.log(`│ Status              │ ${newsApiStatus.padEnd(12)} │ ${newsDataStatus.padEnd(12)} │`);
  console.log("└─────────────────────┴──────────────┴──────────────┘");

  // Show sample articles
  if (results.newsapi?.articles?.length > 0) {
    log.section("\n📰 NewsAPI Sample Articles:");
    results.newsapi.articles.slice(0, 3).forEach((article, i) => {
      console.log(`\n${i + 1}. ${article.title}`);
      console.log(`   Source: ${article.source?.name || "Unknown"}`);
      if (article.description) {
        console.log(`   ${article.description.substring(0, 100)}...`);
      }
    });
  }

  if (results.newsdata?.articles?.length > 0) {
    log.section("\n📡 NewsData.io Sample Articles:");
    results.newsdata.articles.slice(0, 3).forEach((article, i) => {
      console.log(`\n${i + 1}. ${article.title}`);
      console.log(`   Source: ${article.source?.name || "Unknown"}`);
      if (article.language) {
        console.log(`   Language: ${article.language}`);
      }
      if (article.keywords?.length) {
        console.log(`   Keywords: ${article.keywords.slice(0, 3).join(", ")}`);
      }
      if (article.description) {
        console.log(`   ${article.description.substring(0, 100)}...`);
      }
    });
  }

  // Recommendations
  log.section("\n" + "=".repeat(70));
  log.section("RECOMMENDATION");
  log.section("=".repeat(70));

  if (language === "en") {
    log.info("\nFor English content:");
    log.info("• Both APIs work well");
    log.info("• NewsAPI is more established for English news");
    log.info("• NewsData.io offers better metadata (keywords, sentiment)");
  } else {
    log.info(`\nFor ${language.toUpperCase()} content:`);
    
    if (newsDataTotal > newsApiTotal * 2) {
      log.highlight("• NewsData.io has SIGNIFICANTLY more sources");
      log.highlight("• Strongly recommend using NewsData.io");
    } else if (newsDataTotal > newsApiTotal) {
      log.success("• NewsData.io has more sources");
      log.info("• Recommended to use NewsData.io");
    } else if (newsApiTotal > newsDataTotal) {
      log.info("• NewsAPI has more sources for this language");
      log.info("• Consider using NewsAPI");
    } else {
      log.info("• Both APIs have similar coverage");
      log.info("• Choose based on features (metadata, pricing, etc.)");
    }
  }

  console.log("\n");
}

compareAPIs().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
