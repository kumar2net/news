# NewsAPI MCP Server

A Model Context Protocol (MCP) server that provides access to NewsAPI for fetching news articles and headlines.

## ⚠️ SECURITY WARNING

**NEVER commit your API key to version control!** This project is configured to exclude sensitive files, but always verify before pushing to GitHub.

## Setup

1. **Install dependencies:**
   ```bash
   # MCP server
   npm install
   # React dashboard (Berry-inspired UI)
   cd web && npm install
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
   - Optional (frontend-only, for local dev): create `web/.env` and set `VITE_NEWS_API_KEY` so Vite can call NewsAPI directly while running on `localhost`.

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

### Start the MCP server:
```bash
npm start
```

### Run the React dashboard locally:
```bash
cd web
npm run dev
```
Then visit the Vite dev URL (usually `http://127.0.0.1:5173/`). Keep the MCP server running in a separate terminal if you need the stdio tools.

### Available Tools:

1. **get_top_headlines** - Get top headlines
   - Parameters: country, category, pageSize, page

2. **search_news** - Search for news articles
   - Parameters: query (required), language, sortBy, pageSize, from, to

3. **get_sources** - Get available news sources
   - Parameters: category, language, country

## Environment Variables

- `NEWS_API_KEY`: Your NewsAPI key (required – used by MCP server and Vercel API routes)
- `NEWS_API_BASE_URL`: NewsAPI base URL (default: https://newsapi.org/v2)
- `DEFAULT_COUNTRY`: Default country for headlines (default: us)
- `DEFAULT_LANGUAGE`: Default language (default: en)
- `DEFAULT_PAGE_SIZE`: Default number of articles (default: 20)
- `VITE_NEWS_API_KEY`: Optional; only needed in `web/.env` when calling NewsAPI directly from the Vite dev server. Leave unset in production so the browser hits `/api/search-news` instead of calling NewsAPI from the client.

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

## Vercel Deployment

The `web/` directory hosts the React dashboard and API routes. Configure Vercel so that it treats `web` as the project root.

### Deploy to Vercel

1. Import the repository into Vercel (or run `vercel` locally).
2. In **Project → Settings → General → Monorepo**, enable the toggle and set **Root Directory** to `web`.
3. Build settings (Vercel auto-detects Vite):
   - Build command: `npm run build`
   - Output directory: `dist`
4. Environment variables:
   - `NEWS_API_KEY` (Production + Preview + Development) → required for the serverless routes under `web/api/*`.
   - Leave `VITE_NEWS_API_KEY` unset in Production so browsers hit `/api/search-news`. For local dev, keep it in `web/.env`.
5. Save changes and redeploy the latest build (Deployments → Redeploy) so the new settings take effect.

### API Routes (Vercel Functions)

- `/api/top-headlines`
- `/api/search-news`
- `/api/get-sources`

Each route lives in `web/api/` and runs on the Node.js runtime provided by Vercel, forwarding requests to NewsAPI with your key securely injected from the environment.

### Local Vercel Testing

```bash
# Install Vercel CLI (optional)
npm install -g vercel

# Pull remote environment variables for local simulation
vercel env pull web/.env.local

# From the repo root
vercel dev
```

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
