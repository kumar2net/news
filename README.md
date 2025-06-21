# NewsAPI MCP Server

A Model Context Protocol (MCP) server that provides access to NewsAPI for fetching news articles and headlines.

## ⚠️ SECURITY WARNING

**NEVER commit your API key to version control!** This project is configured to exclude sensitive files, but always verify before pushing to GitHub.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `env.example` to `.env`
   - Add your NewsAPI key to the `.env` file:
     ```
     NEWS_API_KEY=your_actual_api_key_here
     NEWS_API_BASE_URL=https://newsapi.org/v2
     DEFAULT_COUNTRY=us
     DEFAULT_LANGUAGE=en
     DEFAULT_PAGE_SIZE=20
     ```

3. **Get a NewsAPI key:**
   - Visit [https://newsapi.org/](https://newsapi.org/)
   - Sign up for a free account
   - Get your API key from the dashboard

## Security

- ✅ API keys are stored in environment variables
- ✅ `.env` file is gitignored to prevent accidental commits
- ✅ All test files use environment variables (no hardcoded keys)
- ✅ Never commit your actual API key to version control

## Usage

### Start the server:
```bash
npm start
```

### Test the enhanced web interface:
```bash
node test-web.js
```
Then visit `http://localhost:3001` for the drill-down interface.

### Available Tools:

1. **get_top_headlines** - Get top headlines
   - Parameters: country, category, pageSize, page

2. **search_news** - Search for news articles
   - Parameters: query (required), language, sortBy, pageSize, from, to

3. **get_sources** - Get available news sources
   - Parameters: category, language, country

## Environment Variables

- `NEWS_API_KEY`: Your NewsAPI key (required)
- `NEWS_API_BASE_URL`: NewsAPI base URL (default: https://newsapi.org/v2)
- `DEFAULT_COUNTRY`: Default country for headlines (default: us)
- `DEFAULT_LANGUAGE`: Default language (default: en)
- `DEFAULT_PAGE_SIZE`: Default number of articles (default: 20)

## Example Usage

### Get top headlines for technology:
```javascript
// Using the MCP server
const result = await mcpClient.callTool('get_top_headlines', {
  category: 'technology',
  country: 'us',
  pageSize: 10
});
```

### Search for AI news:
```javascript
const result = await mcpClient.callTool('search_news', {
  query: 'artificial intelligence',
  language: 'en',
  sortBy: 'publishedAt',
  pageSize: 15
});
```

### Get available sources:
```javascript
const result = await mcpClient.callTool('get_sources', {
  category: 'technology',
  language: 'en'
});
```

## Integration with Cursor

1. Copy the `cursor-mcp-config.json` to your Cursor configuration directory
2. Set your `NEWS_API_KEY` environment variable
3. Restart Cursor to load the MCP server

## Error Handling

The server includes comprehensive error handling for:
- Missing API keys
- Network errors
- Invalid parameters
- API rate limits

## Development

For development with auto-restart:
```bash
npm run dev
```

## Testing

Run tests:
```bash
npm test
```

## Pre-Push Checklist

Before pushing to GitHub, ensure:
- [ ] No API keys are hardcoded in any files
- [ ] `.env` file is not tracked by git
- [ ] All sensitive data uses environment variables
- [ ] `env.example` file exists with placeholder values 