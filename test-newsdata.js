#!/usr/bin/env node

/**
 * Test script for NewsData.io integration
 * 
 * Usage:
 *   node test-newsdata.js
 * 
 * Make sure to set NEWSDATA_API_KEY in your .env file first
 */

require("dotenv").config();
const { getNewsDataClient } = require("./api/newsdata-io");

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  info: (msg) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
  section: (msg) => console.log(`\n${COLORS.cyan}${msg}${COLORS.reset}`),
};

async function testNewsDataAPI() {
  const apiKey = process.env.NEWSDATA_API_KEY;

  if (!apiKey) {
    log.error("NEWSDATA_API_KEY is not set in .env file");
    log.info("Get your API key from: https://newsdata.io/register");
    process.exit(1);
  }

  log.section("=".repeat(60));
  log.section("Testing NewsData.io Integration");
  log.section("=".repeat(60));

  try {
    const client = getNewsDataClient(apiKey);
    log.success("NewsData.io client initialized");

    // Test 1: Fetch latest news in English
    log.section("\nTest 1: Fetch latest English news");
    try {
      const result1 = await client.fetchLatestNews({
        language: "en",
        size: 5,
      });
      log.success(`Fetched ${result1.articles.length} articles`);
      if (result1.articles.length > 0) {
        log.info(`Sample: "${result1.articles[0].title}"`);
        log.info(`Source: ${result1.articles[0].source.name}`);
      }
    } catch (error) {
      log.error(`Failed: ${error.message}`);
    }

    // Test 2: Fetch Arabic news
    log.section("\nTest 2: Fetch Arabic news");
    try {
      const result2 = await client.fetchLatestNews({
        language: "ar",
        size: 5,
      });
      log.success(`Fetched ${result2.articles.length} Arabic articles`);
      if (result2.articles.length > 0) {
        log.info(`Sample: "${result2.articles[0].title}"`);
        log.info(`Language: ${result2.articles[0].language}`);
      }
    } catch (error) {
      log.error(`Failed: ${error.message}`);
    }

    // Test 3: Fetch Hindi news
    log.section("\nTest 3: Fetch Hindi news from India");
    try {
      const result3 = await client.fetchLatestNews({
        language: "hi",
        country: "in",
        size: 5,
      });
      log.success(`Fetched ${result3.articles.length} Hindi articles`);
      if (result3.articles.length > 0) {
        log.info(`Sample: "${result3.articles[0].title}"`);
        log.info(`Language: ${result3.articles[0].language}`);
      }
    } catch (error) {
      log.error(`Failed: ${error.message}`);
    }

    // Test 4: Fetch news by category
    log.section("\nTest 4: Fetch technology news");
    try {
      const result4 = await client.fetchLatestNews({
        category: "technology",
        language: "en",
        size: 5,
      });
      log.success(`Fetched ${result4.articles.length} technology articles`);
      if (result4.articles.length > 0) {
        log.info(`Sample: "${result4.articles[0].title}"`);
        log.info(`Categories: ${result4.articles[0].category?.join(", ")}`);
      }
    } catch (error) {
      log.error(`Failed: ${error.message}`);
    }

    // Test 5: Search news
    log.section("\nTest 5: Search for 'AI' news");
    try {
      const result5 = await client.fetchNews({
        q: "artificial intelligence",
        language: "en",
        size: 5,
      });
      log.success(`Found ${result5.totalResults} total results, showing ${result5.articles.length}`);
      if (result5.articles.length > 0) {
        log.info(`Sample: "${result5.articles[0].title}"`);
        if (result5.articles[0].keywords?.length) {
          log.info(`Keywords: ${result5.articles[0].keywords.join(", ")}`);
        }
      }
    } catch (error) {
      log.error(`Failed: ${error.message}`);
    }

    log.section("\n" + "=".repeat(60));
    log.success("All tests completed!");
    log.section("=".repeat(60));

    log.info("\nNext steps:");
    log.info("1. Update package.json to use api/index-newsdata.js");
    log.info("2. Set DEFAULT_NEWS_PROVIDER=newsdata in .env");
    log.info("3. Test with your frontend application");
    log.info("4. Compare results with NewsAPI");

  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    if (error.response?.data) {
      console.error(error.response.data);
    }
    process.exit(1);
  }
}

// Run tests
testNewsDataAPI();
