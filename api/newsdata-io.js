const axios = require("axios");

/**
 * NewsData.io API integration
 * Provides better non-English news coverage compared to NewsAPI
 * 
 * API Documentation: https://newsdata.io/documentation
 * 
 * Key differences from NewsAPI:
 * - Better coverage of non-English sources
 * - Supports 68+ languages
 * - More sources from Asia, Africa, Latin America
 * - Different parameter structure
 */

const NEWSDATA_BASE_URL = "https://newsdata.io/api/1";

class NewsDataAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = NEWSDATA_BASE_URL;
  }

  /**
   * Fetch latest news articles
   * @param {Object} params - Query parameters
   * @param {string} params.country - Country code (e.g., 'us', 'in', 'jp')
   * @param {string} params.category - Category (e.g., 'business', 'technology', 'sports')
   * @param {string} params.language - Language code (e.g., 'en', 'es', 'ar', 'zh', 'hi', 'ja')
   * @param {string} params.q - Search query
   * @param {number} params.size - Number of results (default 10, max 50 for free tier)
   * @param {string} params.page - Pagination token
   */
  async fetchNews(params = {}) {
    try {
      const requestParams = {
        apikey: this.apiKey,
        ...params,
      };
      
      // Log request for debugging
      console.log('[NewsData.io] Request params:', JSON.stringify(requestParams));
      
      const response = await axios.get(`${this.baseUrl}/news`, {
        params: requestParams,
      });

      return {
        status: response.data.status,
        totalResults: response.data.totalResults,
        articles: this.formatArticles(response.data.results || []),
        nextPage: response.data.nextPage || null,
      };
    } catch (error) {
      console.error("NewsData.io API error:", error.message);
      if (error.response?.data) {
        console.error('[NewsData.io] Error response:', JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  /**
   * Fetch latest news headlines
   * @param {Object} params - Query parameters
   */
  async fetchLatestNews(params = {}) {
    return this.fetchNews({
      ...params,
      size: params.size || 20,
    });
  }

  /**
   * Search news archives (Premium feature)
   * @param {Object} params - Query parameters
   */
  async searchArchive(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/archive`, {
        params: {
          apikey: this.apiKey,
          ...params,
        },
      });

      return {
        status: response.data.status,
        totalResults: response.data.totalResults,
        articles: this.formatArticles(response.data.results || []),
        nextPage: response.data.nextPage || null,
      };
    } catch (error) {
      console.error("NewsData.io Archive API error:", error.message);
      throw error;
    }
  }

  /**
   * Fetch available news sources (Premium feature)
   */
  async fetchSources(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/sources`, {
        params: {
          apikey: this.apiKey,
          ...params,
        },
      });

      return {
        status: response.data.status,
        sources: response.data.results || [],
      };
    } catch (error) {
      console.error("NewsData.io Sources API error:", error.message);
      throw error;
    }
  }

  /**
   * Format articles to match NewsAPI structure for compatibility
   */
  formatArticles(articles) {
    return articles.map((article) => ({
      // NewsAPI compatible fields
      title: article.title,
      description: article.description || article.content,
      url: article.link,
      urlToImage: article.image_url,
      publishedAt: article.pubDate,
      source: {
        id: article.source_id || null,
        name: article.source_name || article.source_id || "Unknown",
      },
      
      // Additional NewsData.io fields
      content: article.content,
      author: article.creator ? article.creator.join(", ") : null,
      category: article.category || [],
      country: article.country || [],
      language: article.language || null,
      keywords: article.keywords || [],
      sentiment: article.sentiment,
      sentimentStats: article.sentiment_stats,
    }));
  }
}

/**
 * Get NewsData.io client instance
 */
const getNewsDataClient = (apiKey) => {
  if (!apiKey) {
    throw new Error("NewsData.io API key is required");
  }
  return new NewsDataAPI(apiKey);
};

module.exports = {
  NewsDataAPI,
  getNewsDataClient,
};
