const { toToolResponse } = require("../utils/response");

const schema = {
  type: "object",
  properties: {
    category: {
      type: "string",
      description: "Category filter",
    },
    language: {
      type: "string",
      description: "Language filter",
    },
    country: {
      type: "string",
      description: "Country filter",
    },
  },
  additionalProperties: false,
};

const createGetSourcesTool = (client) => ({
  name: "get_sources",
  definition: {
    title: "Get Sources",
    description: "Get available news sources",
    inputSchema: schema,
  },
  handler: async (args) => {
    const sources = await client.getSources(args);
    return toToolResponse(sources);
  },
});

module.exports = { createGetSourcesTool };
