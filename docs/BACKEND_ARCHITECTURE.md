# ReflectAI — Backend Architecture (Node.js)

**Version:** 1.0  
**Last Updated:** January 31, 2026  
**Stack:** Node.js 20+, TypeScript 5.x, Express  
**Companion:** [System Architecture](./SYSTEM_ARCHITECTURE.md)

This document describes the Node.js backend for ReflectAI: API routes, conversation processing pipeline, AI integration layer, privacy-first data handling, modular services, and observability hooks.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REFLECTAI BACKEND (Node.js)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  API LAYER (Express)                                              │   │
│   │  /v1/conversations | /v1/analyses | /v1/insights | /v1/users/me   │   │
│   │  Auth · Rate limit · Validate · Error handler · Observability    │   │
│   └───────────────────────────────┬───────────────────────────────────┘   │
│                                   │                                        │
│   ┌───────────────────────────────┼───────────────────────────────────┐   │
│   │  SERVICES                      │                                   │   │
│   │  IngestService ────────────────┼──► Conversation processing       │   │
│   │  AnalysisOrchestratorService ──┼──► Job queue · AI pipeline        │   │
│   │  InsightsService ──────────────┼──► Aggregates · Trends            │   │
│   └───────────────────────────────┼───────────────────────────────────┘   │
│                                   │                                        │
│   ┌───────────────────────────────▼───────────────────────────────────┐   │
│   │  AI INTEGRATION LAYER                                              │   │
│   │  Preprocessing → Sentiment | Clarity | Behavioral → Aggregate       │   │
│   └───────────────────────────────┬───────────────────────────────────┘   │
│                                   │                                        │
│   ┌───────────────────────────────▼───────────────────────────────────┐   │
│   │  DATA + QUEUE (Repository / Queue abstractions)                     │   │
│   │  Conversations · Analyses · Audit log · Job queue                  │   │
│   └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. API Routes

### 2.1 Versioning and Prefix

- All routes live under **`/v1`**.
- Base URL configured via `config.apiPrefix` (e.g. `/api/v1` or `/v1`).

### 2.2 Route Map

| Method | Path | Handler | Description |
|--------|------|---------|--------------|
| POST | `/v1/conversations` | `createConversation` | Ingest conversation (JSON body `{ content }`). Returns `{ id, ... }`. |
| GET | `/v1/conversations` | `listConversations` | List conversations (cursor, limit). Returns `{ data, next_cursor? }`. |
| GET | `/v1/conversations/:id` | `getConversation` | Get conversation by id (tenant-scoped). |
| POST | `/v1/analyses` | `createAnalysis` | Create analysis job (`{ conversation_id, idempotency_key? }`). Returns `{ id, status, ... }`. |
| GET | `/v1/analyses/:id` | `getAnalysis` | Get analysis by id (poll for status/results). |
| GET | `/v1/insights/overview` | `getInsightsOverview` | Dashboard aggregates: `analyses_count`, `completed_count`, `recent_analyses`, `trend_buckets` (sentiment by day). |
| POST | `/v1/users/me/export` | `requestExport` | Enqueue export job (async). |
| DELETE | `/v1/users/me/data` | `deleteUserData` | Enqueue deletion job; return 202. |

**Insights overview response** (`GET /v1/insights/overview`): `{ analyses_count, completed_count, recent_analyses[], trend_buckets?[] }`. Each `trend_bucket` has `{ label, positive, negative, neutral }` for the last 7 days (day label and sentiment counts from completed analyses).

### 2.3 Middleware Order

1. **Observability** — Attach `traceId`, `spanId`, start timer; log request (no PII).
2. **Auth** — Resolve user/tenant; attach to `req`; 401 if missing.
3. **Rate limit** — Per user/tenant; 429 when exceeded.
4. **Body parse** — JSON; size limit (e.g. 1MB for conversations).
5. **Validate** — Schema (e.g. Joi/Zod) for body/params/query.
6. **Route handler** — Call service; return JSON.
7. **Error handler** — Map errors to HTTP status and `{ code, message, details? }`; no stack in response; log with traceId.

### 2.4 Response and Error Contract

- **Success:** `200` or `201` with JSON body (resource or list with `data`, `next_cursor?`).
- **Errors:** JSON `{ code: string, message: string, details?: unknown }`; HTTP status 4xx/5xx.
- **No PII in responses** — IDs only; no raw content in list endpoints unless explicitly requested and consented.

---

## 3. Conversation Processing Pipeline

### 3.1 Flow

1. **Request** — `POST /v1/conversations` with `{ content: string }`.
2. **Validate** — Size limit (e.g. 10MB), encoding; schema.
3. **Normalize** — Trim, normalize line endings; split into messages (e.g. by newline or parser).
4. **Content hash** — Compute SHA-256 of normalized content for deduplication and idempotency.
5. **Persist** — Store conversation (id, tenant_id, user_id, source, content_hash, metadata; **raw content optional** per user/tenant policy).
6. **Response** — Return `{ id, created_at, ... }` (no raw content unless requested).

### 3.1.1 Raw Content Storage (for Analysis)

- **Development:** `storeRawContentByDefault` is `true` so that upload → create analysis can run (orchestrator needs content via `getContent`).
- **Production:** Set `STORE_RAW_CONTENT_DEFAULT=false` if raw content must not be stored; then analysis would require content passed at analysis-creation time (not implemented in MVP).

### 3.2 Ingest Service Responsibilities

- Parse CSV/JSON/plain text (MVP: plain text and JSON).
- Validate schema (min/max length, message count).
- Compute `content_hash`; check duplicate by hash + user if desired.
- Call repository to persist; **do not log raw content**; do log `conversation_id`, `user_id`, `tenant_id`, `content_length`, `content_hash`.
- Enforce tenant isolation (all writes scoped by `tenant_id`/`user_id`).

### 3.3 Privacy in Pipeline

- **Optional raw storage** — If user/tenant policy is “no raw retention”, store only `content_hash` and metadata; pass content to analysis in memory only.
- **Ephemeral processing** — When triggering analysis, pass content from repository (if stored) or from request context into the orchestrator; do not log content; do not persist in AI layer.
- **Audit** — Log “conversation created” with `conversation_id`, `user_id`, `tenant_id`, timestamp (no content).

---

## 4. AI Integration Layer

### 4.1 Purpose

- Single entry for “run full analysis” on a conversation (normalized messages + optional timestamps).
- Output: **AnalysisResult** (sentiment, clarity, behavioral) with `model_version` for reproducibility.
- No HTTP or DB inside the AI layer; called by the orchestrator with in-memory input.

### 4.2 Structure

```
ai/
├── index.ts              # runAnalysis(conversation) → AnalysisResult
├── preprocessing.ts      # Normalize, split messages, optional language detection
├── pipelines/
│   ├── sentiment.ts      # Sentiment pipeline (rule-based or API adapter)
│   ├── clarity.ts        # Clarity pipeline (rules + heuristics)
│   └── behavioral.ts    # Behavioral pipeline (message length, deltas)
└── types.ts              # ConversationInput, AnalysisResult, model_version
```

### 4.3 Pipelines

| Pipeline | Input | Output | Implementation (MVP) |
|----------|--------|--------|------------------------|
| **Sentiment** | Messages (text[]) | Per-message + aggregate sentiment; optional emotional labels | Rule-based (keyword/score) or external API adapter; no logging of input. |
| **Clarity** | Messages | Readability score, sentence complexity, flags | Flesch-Kincaid (or similar), avg sentence length; no external call if not needed. |
| **Behavioral** | Messages + optional timestamps | Message length distribution, response-time deltas | Pure heuristics; no ML. |

### 4.4 Adapter Pattern

- **Sentiment:** Interface `SentimentProvider { analyze(messages: string[]): Promise<SentimentResult> }`. Implementations: `RuleBasedSentimentAdapter`, `OpenAIAdapter` (with strict no-train policy). Config selects adapter.
- **Clarity / Behavioral:** Pure functions or small modules; no external calls in MVP.
- **Aggregation:** Combine pipeline outputs into `AnalysisResult`; add `model_version` and pipeline versions.

### 4.5 Privacy and Security

- Conversation text passed only in memory; not written to disk by AI layer; not logged.
- Tenant/job id passed for tracing only (no PII in trace logs).
- Model versioning: every result includes `model_version` so we can reproduce and regress.

---

## 5. Privacy-First Data Handling

### 5.1 Principles

- **Optional raw persistence** — Config/per-tenant: store raw content or only hash + metadata.
- **Content hashing** — SHA-256 for dedup and idempotency; never log content.
- **Ephemeral AI input** — Content in memory only during analysis; not logged by AI layer.
- **Tenant isolation** — Every query/write filtered by `tenant_id` (and `user_id` where applicable); no cross-tenant access.
- **Audit logging** — Data access, export, delete logged with timestamp, actor, resource id (no PII/raw content).
- **Export/delete** — Async jobs; hard delete for compliance; SLA &lt; 72h for delete.

### 5.2 Implementation Hooks

- **Repository layer** — `createConversation(tenantId, userId, data, options?: { storeRaw: boolean })`. If `storeRaw === false`, persist only hash + metadata.
- **Logger** — Central logger that **never** accepts `content` or PII; accept only ids, counts, hashes.
- **Request context** — Carry `tenantId`, `userId`, `traceId` through the stack; use in DB queries and logs.
- **Sanitizers** — Before any log or metric: strip content; log only `conversation_id`, `analysis_id`, `content_length`, `content_hash` when needed.

---

## 6. Modular Services

### 6.1 Service List

| Service | Role | Depends On |
|---------|------|------------|
| **IngestService** | Parse, validate, hash, persist conversation | Config, ConversationRepository, Logger, Privacy (hash) |
| **AnalysisOrchestratorService** | Create job, enqueue; worker: load conversation, call AI layer, persist result | Queue, ConversationRepository, AnalysisRepository, AI layer, Logger |
| **InsightsService** | Get overview, recent analyses, trends | AnalysisRepository, optional Cache |
| **ExportService** | Enqueue export; worker: build archive, sign URL | Queue, Repositories, Storage, Logger |
| **DeletionService** | Enqueue deletion; worker: cascade delete | Queue, Repositories, Logger, Audit |

### 6.2 Boundaries

- **API layer** — Only HTTP; calls services; no business logic.
- **Services** — Orchestrate repositories, queue, AI layer; no HTTP; use shared logger and config.
- **Repositories** — Data access only; tenant-scoped queries; optional raw storage by policy.
- **AI layer** — Pure analysis; no DB, no queue; called with in-memory conversation.

### 6.3 Dependency Injection

- Use a simple container or factory: inject repositories, queue client, AI runner, config, logger into services.
- Routes receive service instances (e.g. `ingestService`, `orchestratorService`) and call them with `req.user`, `req.tenant`, and validated body/params.

---

## 7. Observability Hooks

### 7.1 Logging

- **Structured JSON** — Every log line: `traceId`, `spanId`, `level`, `message`, optional `userId`, `tenantId`, `conversationId`, `analysisId`, `durationMs`. **Never** `content` or PII.
- **Request logging** — On entry: method, path, traceId; on exit: statusCode, durationMs (no body).
- **Central logger** — Single module used by all services; accepts only safe fields.

### 7.2 Metrics

- **RED for APIs** — Rate (requests per route), Error rate (4xx/5xx), Duration (p50, p95, p99) per route.
- **Custom** — `analysis_jobs_queued`, `analysis_jobs_completed`, `analysis_jobs_failed`, `ai_latency_seconds` (histogram).
- **Hooks** — Middleware records request duration and status; queue worker records job duration and outcome; AI layer reports latency to metrics.
- **Implementation** — Placeholder or OpenTelemetry/StatsD; interface so implementation can be swapped.

### 7.3 Tracing

- **Trace context** — Generate or propagate `traceId`, `spanId` per request; pass to services and AI layer.
- **Spans** — Optional: span for “ingest”, “enqueue analysis”, “AI run”, “persist result”; 100% for errors, sample for success.
- **Implementation** — OpenTelemetry-compatible or simple pass-through in context.

### 7.4 Alerting (Operational)

- **Critical** — API error rate &gt; 5%, DB/queue connection failures, queue backlog &gt; 1000.
- **Warning** — AI latency p95 &gt; 30s, disk usage &gt; 80%.
- Configured outside the app (e.g. Prometheus + Alertmanager); app only exposes metrics and logs.

---

## 8. Folder Structure (Node.js Backend)

```
backend/
├── src/
│   ├── index.ts                 # Entry: load config, start server
│   ├── app.ts                   # Express app: middleware, mount /v1 routes
│   ├── config/
│   │   └── index.ts             # Config from env
│   ├── api/
│   │   ├── routes/
│   │   │   ├── conversations.routes.ts
│   │   │   ├── analyses.routes.ts
│   │   │   ├── insights.routes.ts
│   │   │   └── users.routes.ts
│   │   └── middleware/
│   │       ├── auth.middleware.ts
│   │       ├── error.middleware.ts
│   │       ├── validate.middleware.ts
│   │       ├── rateLimit.middleware.ts
│   │       └── observability.middleware.ts
│   ├── services/
│   │   ├── ingest.service.ts
│   │   ├── orchestrator.service.ts
│   │   ├── insights.service.ts
│   │   └── types.ts
│   ├── ai/
│   │   ├── index.ts             # runAnalysis
│   │   ├── preprocessing.ts
│   │   ├── pipelines/
│   │   │   ├── sentiment.ts
│   │   │   ├── clarity.ts
│   │   │   └── behavioral.ts
│   │   └── types.ts
│   ├── lib/
│   │   ├── logger.ts            # Structured logger; no PII
│   │   ├── metrics.ts           # Metrics interface / placeholder
│   │   ├── privacy.ts           # contentHash, sanitize for logs
│   │   └── trace.ts             # traceId / spanId context
│   ├── repositories/            # Optional: abstract store
│   │   ├── conversation.repository.ts
│   │   └── analysis.repository.ts
│   └── types/
│       └── api.types.ts         # Request context, API error
├── package.json
├── tsconfig.json
└── README.md
```

---

## 9. Summary

| Area | Choice |
|------|--------|
| **API** | Express, /v1 prefix; REST; JSON; structured errors |
| **Conversation pipeline** | Ingest → validate → hash → persist (optional raw); tenant-scoped |
| **AI layer** | Preprocessing → Sentiment | Clarity | Behavioral → Aggregate; adapter for sentiment; no DB/logging of content |
| **Privacy** | Optional raw storage, content hash, ephemeral AI input, tenant isolation, audit log, no PII in logs |
| **Services** | Ingest, Orchestrator, Insights (Export/Deletion optional); modular; inject repos + AI + queue |
| **Observability** | Structured logs (traceId, no PII), RED metrics, trace context, pluggable metrics/tracing |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 31, 2026 | Initial Node.js backend architecture |
| 1.1 | Jan 31, 2026 | Insights overview: trend_buckets (sentiment by day); raw content storage note for dev (storeRawContentByDefault) so analysis has content. |
