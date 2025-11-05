# News Dashboard (Vite + MUI)

This folder hosts the React dashboard that surfaces NewsAPI data via three proxy routes (`client/api/*`). It is deployed independently on Vercel with the same root directory.

## Available scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start the Vite dev server (loads `.env.local` if present). |
| `pnpm run build` | Type-check (`tsc -b`) and create a production bundle in `dist/`. |
| `pnpm run preview` | Serve the production bundle locally. |

> The repo root exposes helper scripts: `pnpm run frontend` (calls `pnpm run dev` here) and `pnpm run dev` (runs backend + frontend together).

## Environment variables

The dashboard reads the same `.env` values as the MCP server through the proxy routes. If you want the browser to talk to NewsAPI directly during dev, add the following to `client/.env.local`:

```ini
VITE_NEWS_API_KEY=your_news_api_key
```

When unset, requests fall back to `/api/search-news`, `/api/top-headlines`, and `/api/get-sources`, which are implemented as Vercel serverless functions (and the local Express proxy during `pnpm run dev`).

## Build & deployment

1. Ensure `NEWS_API_KEY` (and optional defaults) are configured in Vercel → Project Settings → Environment Variables.
2. Build command: `pnpm run build`
3. Output directory: `dist`
4. Serverless functions live alongside the source:
   - `api/search-news.js`
   - `api/top-headlines.js`
   - `api/get-sources.js`

## Linting & formatting

ESLint is configured via `eslint.config.js`. Run `pnpm run lint` (or use your editor’s ESLint integration) before committing large UI changes.
