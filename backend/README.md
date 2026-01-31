# ReflectAI Backend (Node.js)

Node.js backend for ReflectAI: API routes, conversation processing pipeline, AI integration layer, privacy-first data handling, modular services, and observability hooks.

## Stack

- **Node.js** 20+
- **TypeScript** 5.x
- **Express** — REST API under `/v1`
- **In-memory stores** (MVP) — Replace with Postgres + queue in production

## Structure

| Path | Purpose |
|------|---------|
| `src/api/routes/` | Conversations, analyses, insights, users (export/delete) |
| `src/api/middleware/` | Observability, auth, rate limit, validation, error |
| `src/services/` | Ingest, orchestrator, insights |
| `src/ai/` | Preprocessing, sentiment/clarity/behavioral pipelines |
| `src/repositories/` | Conversation and analysis stores (tenant-scoped) |
| `src/lib/` | Logger, metrics, privacy (hash, sanitize), trace |
| `src/config/` | Env-based config |

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/conversations` | Create conversation (body: `{ content }`) |
| GET | `/v1/conversations` | List (query: `cursor`, `limit`) |
| GET | `/v1/conversations/:id` | Get by id |
| POST | `/v1/analyses` | Create analysis job (body: `{ conversation_id, idempotency_key? }`) |
| GET | `/v1/analyses/:id` | Get analysis (poll for status/results) |
| GET | `/v1/insights/overview` | Dashboard overview |
| POST | `/v1/users/me/export` | Request export (202) |
| DELETE | `/v1/users/me/data` | Request deletion (202) |
| GET | `/health` | Health check |

## Auth (MVP)

Send headers:

- `x-user-id` — Required (user identifier)
- `x-tenant-id` — Optional (defaults to user id)

Replace with JWT/session in production.

## Privacy

- **Optional raw storage** — Set `STORE_RAW_CONTENT_DEFAULT=true` to persist content; default is false.
- **Content hash** — SHA-256 for dedup; never log content.
- **Ephemeral AI** — Content passed to AI in memory only; not logged by AI layer.
- **Tenant isolation** — All queries scoped by `tenant_id` / `user_id`.

## Observability

- **Logs** — Structured JSON with `traceId`, `spanId`, no PII. Set `LOG_LEVEL=debug|info|warn|error`.
- **Metrics** — Placeholder in `src/lib/metrics.ts`; implement with OpenTelemetry/StatsD.
- **Trace** — `X-Trace-Id`, `X-Span-Id` on request/response; propagate in logs.

## Setup

```bash
npm install
npm run build
npm start
```

Dev (auto-reload on file changes):

```bash
npm run dev
```

### Running with the frontend

1. **Start the backend** (from this folder): `npm run dev` or `npm run build && npm start` — server runs on **port 3000**.
2. **Start the frontend** (from `../frontend`): `ng serve` (or `npm start`). The Angular dev server proxies `/api` to `http://localhost:3000`, so use the **frontend URL** in the browser (e.g. `http://localhost:4200`), not the backend URL.
3. If you see **"Failed to create conversation"**: ensure the backend is running on port 3000 and you opened the app via the frontend dev server (so the proxy is active). Opening the built frontend from disk or another server without a proxy will cause API calls to fail.

## Config (env)

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| API_PREFIX | /v1 | API path prefix |
| MAX_CONVERSATION_SIZE | 10485760 | Max body size (10MB) |
| RATE_LIMIT_WINDOW_MS | 60000 | Rate limit window |
| RATE_LIMIT_MAX | 100 | Max requests per window |
| AI_MODEL_VERSION | 1.0.0 | Model version in results |
| STORE_RAW_CONTENT_DEFAULT | false | Persist raw content |
| LOG_LEVEL | info | Log level |

## Docs

Full architecture: [Backend Architecture](../docs/BACKEND_ARCHITECTURE.md).
