const { toToolResponse } = require("../utils/response");

const schema = {
  type: "object",
  properties: {
    query: {
      type: "string",
      minLength: 1,
      description: "Search query",
    },
    language: {
      type: "string",
      description: "Language code",
    },
    sortBy: {
      type: "string",
      description: "Sort by (publishedAt, relevancy, popularity)",
    },
    pageSize: {
      type: "integer",
      minimum: 1,
      description: "Number of articles to return",
    },
    from: {
      type: "string",
      description: "Start date (YYYY-MM-DD)",
    },
    to: {
      type: "string",
      description: "End date (YYYY-MM-DD)",
    },
    page: {
      type: "integer",
      minimum: 1,
      description: "Page number",
    },
  },
  required: ["query"],
  additionalProperties: false,
};

const createSearchNewsTool = (client) => ({
  name: "search_news",
  definition: {
    title: "Search News",
    description: "Search for news articles",
    inputSchema: schema,
  },
  handler: async ({ query, ...rest }) => {
    const results = await client.searchNews(query, rest);
    return toToolResponse(results);
  },
});

module.exports = { createSearchNewsTool };
