# News NewsAPI + NewsData.io Server (Current Status)

Unified Node/Express server that proxies to NewsAPI and/or NewsData.io and serves a prebuilt UI from `public/`.

- Backend entry: `api/index-newsdata.js`
- Static site: `public/` (already built assets)
- No `client/` app in this repo right now (scripts updated accordingly)

## ⚠️ Security
- NEVER commit real API keys.
- `.env` is gitignored.

## Setup
1) Install deps
```bash
npm install
```

2) Configure environment variables
- Copy one of the examples to `.env`:
```bash
cp env.example .env
# or, if you pulled from Vercel previously
# cp .env.vercel .env
```
- Edit `.env` and set at least one key (remove any surrounding quotes):
```
# NewsAPI (either name is accepted by the server)
NEWS_API_KEY=your_newsapi_key
# or
NEWSAPI_KEY=your_newsapi_key

# NewsData.io (recommended for non‑English coverage)
NEWSDATA_API_KEY=your_newsdata_key

# Optional defaults
DEFAULT_NEWS_PROVIDER=newsapi   # or: newsdata
NEWS_API_BASE_URL=https://newsapi.org/v2
DEFAULT_COUNTRY=us
DEFAULT_LANGUAGE=en
DEFAULT_PAGE_SIZE=20
```

3) Run
```bash
npm run dev      # nodemon api server at http://localhost:3000
# or
npm start        # node (no auto-reload)
```
On startup you’ll see which providers are active and the default provider.

## Switching providers
- Per request: add `provider=newsapi` or `provider=newsdata` query param.
- Default: set `DEFAULT_NEWS_PROVIDER` in `.env` and restart.

## Endpoints
- GET `/api/news` — Unified top-headlines proxy
  - Query: `country`, `category`, `language`, `pageSize`, `provider`
- GET `/api/search-news` — Search (NewsData.io or NewsAPI depending on provider)
  - Query: `q` (required), `language`, `country`, `category`, `pageSize`, `provider`
- GET `/api/get-sources` — NewsAPI sources list
  - Query: `country`, `language`, `category`
  - Note: This route currently uses NewsAPI only. Results are cached in‑memory per country/language/category for 6h to reduce rate limits.
- POST `/api/translate` — Translate arbitrary texts to English (Google translate endpoint)
  - Body: `{ "texts": ["..."] }`
- GET `/api/health` — Status + which providers are configured

## Rate limits (429 Too Many Requests)
If you see 429s on `/api/get-sources`, you’ve hit NewsAPI’s rate limit. The server now:
- Caches successful source responses (6h) by filter combo.
- Forwards `Retry-After` if provided by upstream and returns a clearer error payload.

Client tips:
- Avoid firing many `/api/get-sources` requests in parallel; debounce user input.
- Reuse cached results (the server already does this for repeats).

## Frontend
- The UI is already built into `public/` and served by the API when available.
- We updated the hero heading to “Headlines from around the world”.
- If you later add a real frontend app, reintroduce scripts as needed; for now, `npm run dev` only runs the backend.

## NPM Scripts
- `dev` — `nodemon api/index-newsdata.js`
- `start` — `node api/index-newsdata.js`
- `test:newsdata` — `node test-newsdata.js`
- `compare` — `node compare-apis.js`

## Troubleshooting
- “No news API key is configured on the server” → ensure `.env` exists in repo root and contains at least one of `NEWS_API_KEY`/`NEWSAPI_KEY` or `NEWSDATA_API_KEY` (without quotes). Restart the server.
- Provider not switching → check `DEFAULT_NEWS_PROVIDER` and verify via `/api/health`.
- 429 on sources → wait for the `Retry-After` window or rely on cached responses; reduce request frequency.

## Pre‑push checklist
- [ ] No real API keys in the repo
- [ ] `.env` is untracked
- [ ] `env.example` has placeholders
