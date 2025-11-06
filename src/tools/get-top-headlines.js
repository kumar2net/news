const { toToolResponse } = require("../utils/response");

const schema = {
  type: "object",
  properties: {
    country: {
      type: "string",
      description: "Country code (e.g., us, gb)",
    },
    category: {
      type: "string",
      description: "News category (e.g., business)",
    },
    pageSize: {
      type: "integer",
      minimum: 1,
      description: "Number of articles to return",
    },
    page: {
      type: "integer",
      minimum: 1,
      description: "Page number",
    },
  },
  additionalProperties: false,
};

const createGetTopHeadlinesTool = (client) => ({
  name: "get_top_headlines",
  definition: {
    title: "Get Top Headlines",
    description: "Retrieve top headlines from NewsAPI",
    inputSchema: schema,
  },
  handler: async (args) => {
    const headlines = await client.getTopHeadlines(args);
    return toToolResponse(headlines);
  },
});

module.exports = { createGetTopHeadlinesTool };
