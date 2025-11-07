# Repository Guidelines

## Project Structure & Module Organization
- `api/` hosts the Express server; `api/index-newsdata.js` is the live entry point, while helpers such as `sampleNewsData.js` and `newsdata-io.js` keep provider logic isolated. Keep new routes under this directory to ensure shared middleware (CORS, env guards) still runs.
- `public/` serves the prebuilt UI; treat it as read-only unless you regenerate static assets elsewhere.
- `src/server.js` powers the MCP server wrapper; extend integrations here rather than inside `api/`.
- Root-level `test-*.js` scripts exercise provider behavior and server responses; mirror that naming pattern for new utilities.
- Config lives at the root (`env.example`, `vercel.json`, `cursor-mcp-config.json`) so agents can find deployment knobs quickly.

## Build, Test, and Development Commands
- `npm install` installs Node 18–22 compatible dependencies (Express, Axios, MCP SDK, MUI).
- `npm run dev` (alias `npm run backend`) starts `nodemon api/index-newsdata.js` with autoreload.
- `npm start` runs the same server with plain Node for production parity.
- `npm run build` is a documented no-op because `public/` already contains compiled assets.
- `npm run test:newsdata` executes `test-newsdata.js`; run `node test-server.js` or `node test-web.js` ad hoc for more targeted checks.
- `npm run compare` diff-checks NewsAPI vs NewsData.io responses via `compare-apis.js`.

## Coding Style & Naming Conventions
- Follow the existing CommonJS style: `require`, 2-space indentation, trailing commas trimmed, and double quotes for strings.
- Prefer async/await with explicit try/catch; log context (`console.warn`) before falling back to sample data.
- Name route handlers `getX`, helper modules `verb-noun.js`, and env variables in screaming snake case.
- Keep shared caches (e.g., `sourcesCache`) in module scope and guard mutating logic with small utilities.

## Testing Guidelines
- Place runnable specs at the project root as `test-*.js` so they can be invoked via `node test-myfeature.js`.
- Tests should stub remote APIs with sample payloads when real keys are absent; fail fast if `process.env` lacks required values.
- Record manual verification steps (provider used, endpoint hit, status) in PR descriptions when adding or changing routes.

## Commit & Pull Request Guidelines
- Recent history favors concise Conventional Commits (`fix: api errors`, `feat: add provider fallback`). Keep using `type: subject` so changelog automation stays viable.
- Reference any related docs (e.g., `NEWSDATA_INTEGRATION.md`) inside the PR summary, describe environment impacts, and attach screenshots or curl logs for UI/API-visible changes.
- Confirm `.env` stays untracked, redact keys from logs, and note which npm scripts you ran before requesting review.

## Security & Configuration Tips
- Never commit real API tokens; copy `env.example` to `.env`, set `NEWSAPI_KEY`/`NEWSDATA_API_KEY`, and keep the file local.
- Verify `DEFAULT_NEWS_PROVIDER` and `NEWS_API_BASE_URL` whenever deploying to Vercel or MCP so downstream agents hit the correct upstream service.
