# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Install dependencies
  - npm install
- Dev server (Express + static `public/`)
  - npm run dev
- Start (no auto-reload)
  - npm start
- MCP server (Model Context Protocol)
  - npm run mcp
- Build (frontend already prebuilt; no-op here)
  - npm run build
- Utility/test scripts
  - Compare NewsAPI vs NewsData.io coverage (optional `LANG` arg)
    - node compare-apis.js [language]
  - Exercise NewsData.io client with sample calls
    - npm run test:newsdata
  - Ad-hoc local checks (not wired to npm scripts)
    - node test-env.js
    - node test-server.js
    - node test-web.js

Notes
- Node version: engines >=18 and <=22 (see package.json).
- To run server commands with a specific provider/key, set env vars (see Environment).

## Environment

Provider keys
- NEWSAPI_KEY or NEWS_API_KEY — NewsAPI key (either works)
- NEWSDATA_API_KEY — NewsData.io key

Provider selection and defaults
- DEFAULT_NEWS_PROVIDER — newsapi | newsdata (defaults to newsapi)
- NEWS_API_BASE_URL — defaults to https://newsapi.org/v2
- DEFAULT_COUNTRY — defaults to us
- DEFAULT_LANGUAGE — defaults to en
- DEFAULT_PAGE_SIZE — defaults to 20
- PORT — Express port (defaults to 3000)

Serverless/hosting hints
- VERCEL — if set, server runs in serverless mode (handlers exported)

MCP server
- NEWS_API_KEY required for MCP tools in src/server.js

Configuration starter files
- env.example — copy to .env and fill placeholders
- .env is gitignored (never commit real keys)

## Architecture overview

High level
- Unified Node/Express API that proxies to NewsAPI and/or NewsData.io and serves a prebuilt UI from public/ when present.
- Separate MCP server exposes NewsAPI tooling over stdio for agent integrations.

Entrypoints
- Runtime API: api/index-newsdata.js
  - Boots Express, mounts JSON routes, optionally serves static public/ assets, exports a handler for serverless.
- MCP server: src/server.js
  - Starts an MCP server with tools: get_top_headlines, search_news, get_sources (NewsAPI-backed).

Routing and capabilities (api/index-newsdata.js)
- /api/news — Unified headlines feed
  - Provider chosen by ?provider= or DEFAULT_NEWS_PROVIDER; falls back based on available keys
  - For provider=newsdata: uses NewsData.io with params country, category, language (size capped by free tier)
  - For provider=newsapi: uses NewsAPI /top-headlines; for country=all it fans out across [us, gb, in, au, ca]
  - Normalizes response to a consistent article shape
- /api/search-news — Keyword search
  - Uses NewsData.io when selected and key present; otherwise NewsAPI /everything
  - Returns provider in X-News-Provider header
- /api/get-sources — Source list
  - Currently backed by NewsAPI only; in-memory cache per (country, language, category) for 6h
  - On 429, forwards Retry-After and returns a friendly error payload
- /api/translate — Batch translate to English via Google public endpoint (simple in-process cache)
- /api/health — Indicates which providers are configured and the default provider

Static assets
- If public/index.html exists, Express serves it and assets; unknown non-/api/ GETs return that index.html.

Serverless adapters
- Vercel-style functions reside in api/*.js (news, search-news, get-sources, translate). Each rewrites req.url to /api/* and forwards to the shared Express app exported from api/index-newsdata.js.

Provider modules
- api/newsdata-io.js wraps NewsData.io endpoints and normalizes results to a NewsAPI-like shape. Caution: free tier caps size (enforced in /api/news).

MCP server details (src/server.js)
- Uses @modelcontextprotocol/sdk over stdio. Tools call NewsAPI endpoints using NEWS_API_KEY. Not aware of NewsData.io.

## Development workflow highlights

- Prefer npm run dev for local work; it uses nodemon with api/index-newsdata.js.
- Provider behavior is selectable per request (?provider=newsapi|newsdata) and globally via DEFAULT_NEWS_PROVIDER. The server auto-detects available keys and falls back when one is missing.
- Source listing (/api/get-sources) is NewsAPI-only; expect 429s under rate limits. The server caches successful responses for six hours and forwards Retry-After when present.
- The UI in public/ is already built and served statically; there’s no frontend build step here unless you reintroduce a client app.
