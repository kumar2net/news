const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");
const { parseConfig } = require("./config");
const { NewsApiClient } = require("./news-api-client");
const { buildTools } = require("./tools");

const registerTools = (server, tools) => {
  tools.forEach(({ name, definition, handler }) => {
    server.registerTool(name, definition, handler);
  });
};

const createServer = () => {
  const config = parseConfig();

  const client = new NewsApiClient({
    apiKey: config.NEWS_API_KEY,
    baseUrl: config.NEWS_API_BASE_URL,
    defaultCountry: config.DEFAULT_COUNTRY,
    defaultLanguage: config.DEFAULT_LANGUAGE,
    defaultPageSize: config.DEFAULT_PAGE_SIZE,
  });

  const server = new McpServer({
    name: "newsapi-mcp-server",
    version: "1.0.0",
  });

  registerTools(server, buildTools(client));

  return { server, transport: new StdioServerTransport() };
};

module.exports = { createServer };
