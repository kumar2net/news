const { createGetTopHeadlinesTool } = require("./get-top-headlines");
const { createSearchNewsTool } = require("./search-news");
const { createGetSourcesTool } = require("./get-sources");

const buildTools = (client) => [
  createGetTopHeadlinesTool(client),
  createSearchNewsTool(client),
  createGetSourcesTool(client),
];

module.exports = { buildTools };
