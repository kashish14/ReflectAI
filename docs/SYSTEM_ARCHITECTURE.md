# ReflectAI — System Architecture Document

**Version:** 1.0  
**Last Updated:** January 31, 2026  
**Audience:** Engineering, DevOps, Security  
**Companion:** [Product Vision Document](./PRODUCT_VISION.md)

---

## 1. High-Level Architecture Overview

ReflectAI follows a **layered, event-driven architecture** with clear separation between presentation, orchestration, AI processing, and data persistence. The design prioritizes privacy-by-default, horizontal scalability, and the ability to support both cloud and local-first deployment modes.

### Architectural Style

- **Layered architecture** — Strict boundaries between API, service, AI, and data layers.
- **Asynchronous processing** — Conversation analysis runs asynchronously via a job queue; results are delivered via polling or push.
- **Multi-tenancy** — Tenant isolation at the data layer; no cross-tenant data access in application logic.

### System Context

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              REFLECTAI SYSTEM BOUNDARY                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌───────────┐  │
│   │   Web App    │     │   Mobile     │     │   API        │     │  Integra- │  │
│   │   (SPA)      │     │   (Future)   │     │   Clients    │     │  tions    │  │
│   └──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └─────┬─────┘  │
│          │                    │                    │                   │         │
│          └────────────────────┼────────────────────┼───────────────────┘         │
│                               │                    │                             │
│                               ▼                    ▼                             │
│                    ┌──────────────────────────────────────────┐                  │
│                    │           API GATEWAY / BFF               │                  │
│                    │     (Auth, Rate Limit, Routing)           │                  │
│                    └────────────────────┬─────────────────────┘                  │
│                                         │                                         │
│          ┌──────────────────────────────┼──────────────────────────────┐         │
│          │                              │                              │         │
│          ▼                              ▼                              ▼         │
│   ┌─────────────┐              ┌─────────────┐              ┌─────────────┐      │
│   │  Ingest     │              │  Analysis   │              │  Insights   │      │
│   │  Service    │              │  Orchestrator│              │  Service    │      │
│   └──────┬──────┘              └──────┬──────┘              └──────┬──────┘      │
│          │                            │                            │             │
│          │                            ▼                            │             │
│          │                   ┌─────────────────┐                   │             │
│          │                   │  AI Processing  │                   │             │
│          │                   │  Layer          │                   │             │
│          │                   │  (Sentiment,    │                   │             │
│          │                   │   Clarity,      │                   │             │
│          │                   │   Behavioral)   │                   │             │
│          │                   └────────┬────────┘                   │             │
│          │                            │                            │             │
│          └────────────────────────────┼────────────────────────────┘             │
│                                       │                                          │
│                                       ▼                                          │
│                    ┌──────────────────────────────────────────┐                  │
│                    │     DATA LAYER (Encrypted at Rest)        │                  │
│                    │  Conversations │ Analyses │ User Meta     │                  │
│                    └──────────────────────────────────────────┘                  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

         EXTERNAL ACTORS: Users, Integrations (Slack, Gmail, etc.)
```

### Key Principles

- **Privacy by design** — Data flows are explicit; raw conversation storage is optional and user-configurable.
- **Stateless services** — API and orchestration layers are stateless; state lives in the data layer and job queue.
- **Fail-safe defaults** — If AI or a downstream service fails, the system degrades gracefully (queued retry, partial results, or clear error); no silent data loss.

---

## 2. Frontend Architecture

### Technology Stack (Recommended)

- **Framework:** React 18+ (or Next.js for SSR/SSG where SEO or initial load matters)
- **State:** React Query (TanStack Query) for server state; Zustand or Context for minimal client state
- **Styling:** Tailwind CSS with CSS variables for theming (supports light/dark, accessibility)
- **Charts/Visualization:** Recharts or Visx for time-series and clarity/sentiment dashboards

### Application Structure

```
src/
├── app/                    # Routes, layout, providers
├── features/               # Feature-based modules
│   ├── auth/
│   ├── conversations/      # Upload, list, detail
│   ├── analysis/           # Insights, charts, trends
│   ├── privacy/            # Data export, delete, retention settings
│   └── settings/
├── shared/
│   ├── components/         # UI primitives, layouts
│   ├── hooks/
│   ├── api/                # API client, types
│   └── utils/
└── assets/
```

### Frontend Patterns

- **Feature-sliced design** — Each feature owns its UI, hooks, and API surface. Shared components are generic and reusable.
- **Optimistic UI** — Non-critical actions (e.g., toggle retention) update immediately; rollback on error.
- **Progressive disclosure** — Heavy visualizations (charts, trends) load lazily; skeletons and loading states for async data.
- **Accessibility** — WCAG 2.1 AA target; keyboard navigation, ARIA labels, sufficient contrast.

### Client-Side Data Handling

- **No PII in URLs** — Conversation IDs only; no titles or content in query params.
- **Sensitive data in memory only** — When pasting/editing raw text, content stays in component state until explicit submit; no localStorage for conversation body.
- **Consent UI** — Privacy dashboard and consent flows are first-class; no dark patterns.

---

## 3. Backend Architecture

### Service Decomposition

| Service | Responsibility | Scale |
|---------|----------------|-------|
| **API Gateway / BFF** | Auth, rate limiting, routing, request validation | Horizontally scalable |
| **Ingest Service** | Parse uploads (CSV, JSON, plain text), validate schema, persist or queue | Stateless |
| **Analysis Orchestrator** | Create analysis jobs, coordinate AI pipeline, aggregate results | Stateless; job-driven |
| **Insights Service** | Serve computed insights, trends, aggregates; cache where appropriate | Stateless |
| **AI Processing Layer** | Sentiment, clarity, behavioral models; see Section 4 | Isolated, scalable |

### API Design

- **REST over HTTPS** — Resource-oriented; versioned (`/v1/`).
- **Idempotency** — Analysis submission accepts optional idempotency key to prevent duplicate jobs.
- **Pagination** — Cursor-based for conversations and analyses; limit cap (e.g., 100).
- **Error contract** — Structured JSON errors with `code`, `message`, `details`; HTTP status aligned with semantics.

### Data Models (Logical)

**Conversation**

- `id`, `tenant_id`, `user_id`, `source` (manual, slack, gmail, etc.)
- `content_hash` (for deduplication), `metadata` (timestamps, participants if available)
- Raw content optionally stored; retention policy applies

**Analysis**

- `id`, `conversation_id`, `status` (pending, running, completed, failed)
- `results` (JSON): sentiment scores, clarity metrics, behavioral stats
- `created_at`, `completed_at`

**User / Tenant**

- Standard identity; tenant scoping for enterprise.

---

## 4. AI Processing Layer

### Responsibilities

1. **Sentiment analysis** — Per-message and aggregate sentiment (positive/negative/neutral); optional emotional labels (joy, frustration, anxiety, etc.).
2. **Clarity scoring** — Readability (e.g., Flesch-Kincaid), sentence complexity, jargon detection, ambiguity flags.
3. **Behavioral analysis** — Message length distribution, response time patterns (when timestamps exist), activity rhythm.

### Architecture Options

| Mode | Description | Use Case |
|------|-------------|----------|
| **Cloud** | Models run in a dedicated AI service (GPU optional) | Default for MVP; batch processing |
| **Local-first** | Models run on user device (WebAssembly, ONNX, or native) | Privacy-sensitive users; future phase |

### Implementation Approach (MVP — Cloud)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI PROCESSING LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Input: Conversation (messages + optional timestamps)           │
│                           │                                      │
│                           ▼                                      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Preprocessing                                           │   │
│   │  - Normalization, language detection, split by message   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                           │                                      │
│           ┌───────────────┼───────────────┐                      │
│           ▼               ▼               ▼                      │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│   │  Sentiment   │ │  Clarity     │ │  Behavioral  │            │
│   │  Pipeline    │ │  Pipeline    │ │  Pipeline    │            │
│   │  (NLP model) │ │  (rules +    │ │  (stats +    │            │
│   │              │ │   heuristics)│ │   heuristics)│            │
│   └──────┬───────┘ └──────┬───────┘ └──────┬───────┘            │
│          │                │                │                     │
│          └────────────────┼────────────────┘                     │
│                           ▼                                      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Aggregation & Output                                    │   │
│   │  - Time-series, aggregates, trend flags                  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                           │                                      │
│   Output: AnalysisResult (JSON)                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Model Choices (MVP)

- **Sentiment:** Fine-tuned transformer (e.g., DistilBERT) or API-based (e.g., OpenAI for higher quality, with strict data-use agreement). Open-source alternative: `transformers` + `textblob` for baseline.
- **Clarity:** Rule-based (Flesch-Kincaid, avg sentence length) + optional LLM for jargon/ambiguity. Keeps latency predictable and cost low.
- **Behavioral:** Pure heuristics; no ML required. Message count, avg length, timestamp deltas.

### Isolation and Security

- **Tenant isolation** — Each job tagged with `tenant_id`; no cross-tenant batching.
- **Ephemeral processing** — Input text passed to models; not logged or persisted beyond analysis results unless user opts in.
- **Model versioning** — Results include `model_version` for reproducibility and regression detection.

---

## 5. Data Flow Diagrams (Textual)

### Flow 1: Conversation Upload and Analysis (Happy Path)

1. **User** uploads or pastes conversation via Web App.
2. **Frontend** validates format (size, encoding), sends `POST /v1/conversations` with multipart or JSON body.
3. **API Gateway** authenticates user, applies rate limit, routes to Ingest Service.
4. **Ingest Service** parses payload, validates schema, computes `content_hash`, persists conversation (or enqueues for async persist). Returns `conversation_id`.
5. **Ingest Service** (or client) calls `POST /v1/analyses` with `conversation_id`. Orchestrator enqueues analysis job.
6. **Orchestrator** picks up job, fetches conversation from store, invokes AI Processing Layer.
7. **AI Layer** runs sentiment, clarity, behavioral pipelines, returns `AnalysisResult`.
8. **Orchestrator** persists `AnalysisResult` to Analysis store, marks job complete.
9. **User** polls `GET /v1/analyses/{id}` or receives webhook/push when status = `completed`.
10. **User** views insights in frontend; Insights Service serves cached or on-demand aggregates.

### Flow 2: Privacy — Data Export

1. **User** requests export from Privacy Dashboard.
2. **Frontend** calls `POST /v1/users/me/export`.
3. **Backend** enqueues export job (async; large payloads).
4. **Export worker** assembles user’s conversations, analyses, and metadata into a structured archive (JSON/CSV).
5. **Worker** uploads to signed, time-limited URL (e.g., S3 pre-signed); user notified.
6. **User** downloads within expiry window (e.g., 24h). Archive not retained after expiry.

### Flow 3: Privacy — Data Deletion

1. **User** triggers delete from Privacy Dashboard.
2. **Frontend** calls `DELETE /v1/users/me/data` with confirmation.
3. **Backend** enqueues deletion job, returns immediate 202 Accepted.
4. **Deletion worker** cascades: analyses → conversations → user-specific metadata. Hard delete; no soft-delete for compliance.
5. **Worker** logs completion; SLA target < 72 hours from request.

### Flow 4: Local-First Mode (Future)

1. **User** enables local-first in settings; no cloud analysis.
2. **Frontend** loads WASM/ONNX models (cached after first load).
3. **Conversation** stays in browser; never sent to server.
4. **Processing** runs in Web Worker; results rendered locally.
5. **Optional sync** — User may choose to sync anonymized aggregates only (no raw content) for benchmarking; explicit opt-in.

---

## 6. Privacy-First Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Optional raw content persistence** | Users can request analysis without storing raw text; only derived insights retained. Reduces blast radius of any breach. |
| **Content hashing for dedup** | Enables idempotency and deduplication without retaining full content when not needed. |
| **Ephemeral AI input** | Conversation text passed to models in memory; not logged. Only structured results persisted. |
| **Encryption at rest** | All persisted data encrypted (e.g., AES-256); keys managed via KMS or HSM in production. |
| **Encryption in transit** | TLS 1.3 only; no plaintext over wire. |
| **Tenant isolation** | `tenant_id` on every record; query filters enforced at ORM/DB layer. No cross-tenant joins. |
| **Audit logging** | Data access, export, delete events logged with timestamp, actor, resource. Immutable log store. |
| **Consent in metadata** | Each conversation/analysis carries consent flags; deletion respects granular revocations. |
| **Local-first path** | Architecture allows offloading AI to client; cloud becomes optional. |

### Data Retention

- **Default:** 30 days for raw content; insights retained per user preference (e.g., 90 days, 1 year, indefinite).
- **Enterprise:** Configurable per tenant; support for 0-day retention (process-only, no persist).

---

## 7. Scalability Considerations

### Horizontal Scaling

- **API / BFF:** Stateless; scale behind load balancer. Auto-scale on CPU or request rate.
- **Ingest / Orchestrator / Insights:** Stateless; same pattern.
- **AI workers:** Scale worker pool based on queue depth. GPU workers for heavy models; CPU for lightweight.
- **Data layer:** Read replicas for analytics and dashboard queries; primary for writes.

### Bottlenecks and Mitigations

| Bottleneck | Mitigation |
|------------|------------|
| AI model latency | Async jobs; user does not block. Batch small conversations where possible. |
| Large conversation uploads | Chunked upload, stream parsing; reject over size limit (e.g., 10MB) with clear error. |
| Database write load | Batch inserts for analysis results; consider append-only event store for audit. |
| Cold start (local-first) | Model caching, CDN for WASM/ONNX; progressive loading. |

### Capacity Planning (MVP)

- **Target:** 10K MAU, ~50K analyses/month.
- **Peak:** 500 concurrent users; 100 analyses/hour.
- **Sizing:** 3–5 API instances, 2–4 AI workers, single DB instance with replica. Revisit at 5x load.

---

## 8. Observability and Monitoring

### Pillars

**Logs**

- Structured JSON logs (trace_id, span_id, user_id, tenant_id, level, message).
- Centralized aggregation (e.g., Loki, CloudWatch, Datadog).
- No PII or raw conversation content in logs.

**Metrics**

- **RED** for APIs: Rate, Error rate, Duration (p50, p95, p99).
- **USE** for resources: Utilization, Saturation, Errors.
- Custom: `analysis_jobs_queued`, `analysis_jobs_completed`, `analysis_jobs_failed`, `ai_latency_seconds`.

**Traces**

- Distributed tracing (OpenTelemetry); trace across API → Orchestrator → AI → DB.
- Sampling in production (e.g., 10%); 100% for errors.

**Alerting**

- **Critical:** API error rate > 5%, DB connection failures, queue backlog > 1000.
- **Warning:** AI latency p95 > 30s, disk usage > 80%.

**Dashboards**

- System health (latency, errors, throughput).
- Business (analyses/day, active users).
- Privacy (export/delete completion time, retention compliance).

---

## 9. Deployment Architecture

### Cloud Deployment (MVP)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLOUD (e.g., AWS / GCP)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────┐     ┌─────────────────────────────────────────────┐   │
│   │   CDN       │     │              Load Balancer                   │   │
│   │   (Static)  │     └─────────────────────┬───────────────────────┘   │
│   └─────────────┘                           │                           │
│                                             │                           │
│   ┌─────────────────────────────────────────▼───────────────────────┐   │
│   │                    Compute (Containers / ECS / Cloud Run)        │   │
│   │   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│   │   │ API     │ │ Ingest  │ │Orchestr.│ │ Insights│ │ AI      │   │   │
│   │   │         │ │         │ │         │ │         │ │ Workers │   │   │
│   │   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                             │                           │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│   │  RDS / Cloud SQL │  │  Redis (cache,   │  │  S3 / GCS        │     │
│   │  (Primary + Repl)│  │   queue)         │  │  (exports, etc.) │     │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Environment Strategy

- **Development** — Local Docker Compose; mock AI for speed.
- **Staging** — Mirrors prod; smaller scale; synthetic data only.
- **Production** — Multi-AZ; automated backups; blue-green or canary deploys.

### Infrastructure as Code

- Terraform or Pulumi for cloud resources.
- Kubernetes or managed containers (ECS, Cloud Run) for services.
- Secrets in vault (e.g., AWS Secrets Manager); never in code or config files.

### On-Prem / Enterprise (Future)

- Same container images; deployable to customer VPC or air-gapped env.
- External DB (customer-provided Postgres) or bundled DB with encryption.
- No outbound calls to ReflectAI cloud unless explicitly opted (e.g., license check, telemetry).

---

## 10. Trade-offs and Design Decisions

| Decision | Alternatives Considered | Rationale |
|----------|-------------------------|-----------|
| **Async analysis** | Synchronous API call | AI latency (5–30s) unacceptable for request-response. Async + polling keeps API responsive; webhooks optional. |
| **Optional raw storage** | Always persist raw | Privacy principle: minimize data. Optional storage adds code paths but aligns with user trust. |
| **REST over GraphQL** | GraphQL | REST sufficient for MVP; simpler caching and rate limiting. GraphQL deferred for complex dashboard needs. |
| **Monolith vs microservices** | Start modular monolith | Clear service boundaries in code; deploy as single or split later. Avoids operational overhead at MVP stage. |
| **Cloud-first AI** | Local-first only | Local-first requires WASM/ONNX maturity and limits model quality. Cloud MVP unlocks faster iteration; local-first as additive option. |
| **Rule-based clarity** | Full LLM | Rules are fast, cheap, explainable. LLM for jargon/ambiguity can be added later. Balance of quality and cost. |
| **Cursor pagination** | Offset pagination | Cursor avoids deep offset performance issues and consistency problems with high churn. |
| **Hard delete** | Soft delete | GDPR/CCPA expect erasure. Soft delete adds complexity; hard delete with audit log suffices. |
| **Single region MVP** | Multi-region | Cost and complexity. Single region acceptable for MVP; multi-region for latency and compliance in future. |

### Technical Debt and Future Work

- **Local-first AI** — Requires model export (ONNX), WASM runtime, and UI for model loading. Defer to Phase 2.
- **Real-time streaming analysis** — Current design is batch. Streaming would need WebSocket + chunked processing.
- **Multi-language** — MVP assumes English; add language detection and multi-language models in roadmap.

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **BFF** | Backend-for-Frontend; API layer tailored to client needs |
| **Tenant** | Isolated customer/org in multi-tenant system |
| **Content hash** | Cryptographic hash of conversation content for deduplication |
| **Ephemeral** | Not persisted; exists only in memory during processing |

---

## Appendix B: Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 31, 2026 | — | Initial draft |

---

*This document should be reviewed when introducing new services, changing data flows, or expanding to local-first or on-prem deployments.*
