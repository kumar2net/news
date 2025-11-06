const { createServer } = require("./create-server");

(async () => {
  try {
    const { server, transport } = createServer();
    await server.connect(transport);
    console.log("NewsAPI MCP Server started");
  } catch (error) {
    console.error("Failed to start NewsAPI MCP Server:", error.message);
    process.exitCode = 1;
  }
})();
