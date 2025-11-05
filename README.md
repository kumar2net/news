# NewsAPI MCP Server & Dashboard

This repository hosts two pieces that work together:

- **MCP server** (`src/server.js`) — exposes NewsAPI via the Model Context Protocol.
- **News dashboard** (`client/`) — Vite + React + MUI interface that consumes the MCP tools / REST proxy.

Both are configured to use the same NewsAPI credentials so you can explore articles locally or from Vercel.

## ⚠️ Security

**Never commit API keys.** `.env` and client `.env.*` files are already ignored, but always double-check before pushing.

## Project Layout

- `api/` – lightweight Express proxy for local development (`pnpm run dev`).
- `client/` – Vite/MUI dashboard and Vercel serverless functions (`client/api/*`).
- `src/` – MCP server implementation.
- `env.example` – template for the environment variables shared by MCP + API proxy.

## Prerequisites

- Node.js 18+ (project currently tested on Node 24.x)
- [pnpm](https://pnpm.io/) 8+
- NewsAPI key ([newsapi.org](https://newsapi.org/))

## Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

   This installs root dependencies (MCP + Express proxy) and the Vite client via pnpm’s workspace awareness.

2. **Configure environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your NewsAPI key and optional defaults:

   ```ini
   NEWS_API_KEY=your_actual_api_key
   NEWS_API_BASE_URL=https://newsapi.org/v2
   DEFAULT_COUNTRY=us
   DEFAULT_LANGUAGE=en
   DEFAULT_PAGE_SIZE=20
   ```

   Optional: create `client/.env.local` with `VITE_NEWS_API_KEY` if you want the browser to call NewsAPI directly during dev. When unset, the UI goes through the `/api/*` proxy.

3. **(Optional) Cursor integration**

   - Copy `cursor-mcp-config.json` into your Cursor config directory.
   - Ensure `NEWS_API_KEY` is exported in the shell that launches Cursor.

## Local Development

- **Run MCP + dashboard together**

  ```bash
  pnpm run dev
  ```

  This launches the Express proxy (`http://localhost:3000`) and the Vite client (`http://localhost:5173`). The client proxies `/api/*` requests to the local Express server.

- **Run pieces independently**

  ```bash
  pnpm run backend   # Express API proxy
  pnpm run frontend  # Dashboard (Vite dev server)
  pnpm run mcp       # MCP stdio server
  ```

## MCP Tools

| Tool name         | Description                     | Key inputs                           |
|-------------------|---------------------------------|--------------------------------------|
| `get_top_headlines` | Top headlines endpoint          | `country`, `category`, `pageSize`, `page` |
| `search_news`       | Full-text article search        | `query` (required), plus filters     |
| `get_sources`       | Available NewsAPI sources       | `category`, `language`, `country`    |

All tools read the same NewsAPI credentials from `.env`.

## Deployment (Vercel)

1. In Vercel **Project → Settings → General**, set **Root Directory** to `client`.
2. Build command: `pnpm run build`
3. Output directory: `dist`
4. Environment variables (Production, Preview, Development):
   - `NEWS_API_KEY`
   - Optional defaults (`DEFAULT_COUNTRY`, etc.) if you override them.
5. Redeploy. The dashboard will serve from `client/dist`, while the proxy routes live in `client/api/*`:

   - `/api/search-news`
   - `/api/top-headlines`
   - `/api/get-sources`

### Testing Vercel build locally

```bash
pnpm --filter client run build
pnpm --filter client run preview
```

Optionally install the Vercel CLI (`npm i -g vercel`) and run `vercel dev` from the repo root after `vercel env pull`.

## Troubleshooting

- **Unexpected token `<` / not valid JSON** — usually means the proxy returned HTML. Ensure the Express server is running locally (or serverless functions deployed) and that `NEWS_API_KEY` exists.
- **401 / 426 errors** — NewsAPI key missing/invalid or free tier limits exceeded.
- **Local topics not persisting** — check browser storage; clear `localStorage['news_topics']` to reset.

## Testing

Jest scripts exist but no suites are configured yet. Add tests in `__tests__/` and run:

```bash
pnpm test
```

## Pre-push checklist

- [ ] `.env` or client `.env.*` never staged
- [ ] `pnpm run build` passes
- [ ] Vercel root set to `client` (for deployments)
- [ ] API key stored securely in Vercel / local environment
