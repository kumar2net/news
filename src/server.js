const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const axios = require("axios");
require("dotenv").config();

class NewsAPIMCPServer {
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseUrl = process.env.NEWS_API_BASE_URL || "https://newsapi.org/v2";

    if (!this.apiKey) {
      throw new Error("NEWS_API_KEY environment variable is required");
    }
  }

  async getTopHeadlines(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/top-headlines`, {
        params: {
          apiKey: this.apiKey,
          country: params.country || process.env.DEFAULT_COUNTRY || "us",
          category: params.category,
          pageSize: params.pageSize || process.env.DEFAULT_PAGE_SIZE || 20,
          page: params.page || 1,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching top headlines:", error.message);
      throw error;
    }
  }

  async searchNews(query, params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          apiKey: this.apiKey,
          q: query,
          language: params.language || process.env.DEFAULT_LANGUAGE || "en",
          sortBy: params.sortBy || "publishedAt",
          pageSize: params.pageSize || process.env.DEFAULT_PAGE_SIZE || 20,
          page: params.page || 1,
          from: params.from,
          to: params.to,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching news:", error.message);
      throw error;
    }
  }

  async getSources(params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/sources`, {
        params: {
          apiKey: this.apiKey,
          category: params.category,
          language: params.language || process.env.DEFAULT_LANGUAGE || "en",
          country: params.country || process.env.DEFAULT_COUNTRY || "us",
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching sources:", error.message);
      throw error;
    }
  }
}

(async () => {
  const newsAPI = new NewsAPIMCPServer();
  const server = new McpServer({
    name: "newsapi-mcp-server",
    version: "1.0.0",
  });

  server.registerTool(
    "get_top_headlines",
    {
      title: "Get Top Headlines",
      description: "Get top headlines from NewsAPI",
      inputSchema: z.object({
        country: z.string().optional().describe("Country code (e.g., us, gb)"),
        category: z
          .string()
          .optional()
          .describe("News category (e.g., business, technology)"),
        pageSize: z
          .number()
          .optional()
          .describe("Number of articles to return"),
        page: z.number().optional().describe("Page number"),
      }),
    },
    async (args) => {
      const headlines = await newsAPI.getTopHeadlines(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(headlines, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "search_news",
    {
      title: "Search News",
      description: "Search for news articles",
      inputSchema: z.object({
        query: z.string().describe("Search query"),
        language: z.string().optional().describe("Language code"),
        sortBy: z
          .string()
          .optional()
          .describe("Sort by (publishedAt, relevancy, popularity)"),
        pageSize: z
          .number()
          .optional()
          .describe("Number of articles to return"),
        from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
        to: z.string().optional().describe("End date (YYYY-MM-DD)"),
        page: z.number().optional().describe("Page number"),
      }),
    },
    async (args) => {
      const searchResults = await newsAPI.searchNews(args.query, args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(searchResults, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_sources",
    {
      title: "Get Sources",
      description: "Get available news sources",
      inputSchema: z.object({
        category: z.string().optional().describe("Category filter"),
        language: z.string().optional().describe("Language filter"),
        country: z.string().optional().describe("Country filter"),
      }),
    },
    async (args) => {
      const sources = await newsAPI.getSources(args);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(sources, null, 2),
          },
        ],
      };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("NewsAPI MCP Server started");
})(); 