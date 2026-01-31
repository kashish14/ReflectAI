# ReflectAI — Engineering Decision Log

**Version:** 1.0  
**Last Updated:** January 31, 2026  
**Audience:** Engineering, new hires, external reviewers  
**Companion docs:** [Product Vision](./PRODUCT_VISION.md), [System Architecture](./SYSTEM_ARCHITECTURE.md)

---

## Purpose

This log records significant engineering and architectural decisions for ReflectAI: the context, options considered, rationale, and consequences. It is maintained so that future engineers (and future us) understand *why* the system is built the way it is, not just *what* was built. Decisions are written in past tense at the time of recording; status and follow-ups are noted where relevant.

---

## Format

Each entry follows:

- **Title** — Short, searchable name
- **Status** — Accepted | Superseded | Deprecated
- **Context** — What problem we were solving and what constraints existed
- **Decision** — What we decided to do
- **Rationale** — Why we chose this over alternatives
- **Consequences** — Trade-offs, costs, and follow-up work

---

## EDL-001: Modular Architecture (Layered, Service-Bounded)

**Status:** Accepted  
**Date:** 2026-01

### Context

We needed an architecture that could support MVP delivery, future local-first and on-prem deployment, and clear ownership of privacy-sensitive code paths. We also wanted to avoid both a “big ball of mud” and the operational overhead of many independent services at launch.

### Decision

Adopt a **modular architecture** with strict layering (API → orchestration → AI → data) and well-defined service boundaries (Ingest, Analysis Orchestrator, Insights, AI Processing), implemented initially as a **modular monolith** with the option to extract services later. Frontend follows **feature-sliced design** (features own UI, hooks, and API surface; shared code is generic).

### Rationale

- **Privacy and auditability:** Privacy rules (retention, export, delete, consent) and data flows are easier to reason about and audit when boundaries are explicit. Cross-boundary calls are visible and testable.
- **Deployment flexibility:** The same boundaries support a single deploy for MVP, then per-service deploys (e.g., AI workers, ingest) when scaling or compliance (e.g., on-prem AI) requires it. No rewrite needed to “break apart” the system.
- **Team scaling:** Features (conversations, analysis, privacy, settings) can be owned by different engineers or teams without stepping on each other. Shared contracts (API, types) stay in clear modules.
- **Modular monolith over microservices at MVP:** We explicitly chose *not* to go full microservices at day one. Operational cost (deploy pipelines, service discovery, distributed tracing, failure modes) would have slowed delivery without clear benefit at 10K MAU. We get 80% of the benefit (clear boundaries, testability, future split-ability) with one deploy surface and one data store to start.

### Consequences

- **Positive:** Clear ownership, easier refactors, predictable data flow, straightforward local and staging runs.
- **Negative:** We must enforce boundaries in code review and avoid “convenience” cross-layer shortcuts. Splitting a service later will require discipline (no hidden shared DB tables or in-process coupling).
- **Follow-up:** When we extract the first service (e.g., AI workers), document the new deploy and contract in the System Architecture and this log.

---

## EDL-002: Privacy-First Design as a Non-Negotiable Constraint

**Status:** Accepted  
**Date:** 2026-01

### Context

ReflectAI’s value proposition is “understand how you communicate—without giving up control of your data.” Users include coaches, therapists, and enterprises in regulated industries. Privacy is a product differentiator and a compliance requirement, not an afterthought.

### Decision

Treat **privacy-first design** as a non-negotiable architectural constraint. Concretely: optional raw conversation persistence, ephemeral AI input (no logging of conversation text), encryption at rest and in transit, tenant isolation at the data layer, consent and retention in metadata, audit logging for data access/export/delete, and a documented path to local-first processing.

### Rationale

- **Trust and adoption:** In communication analytics, the moment we persist or log raw content without clear user control, we lose the trust of privacy-sensitive users and enterprises. Designing for minimal data and user control from day one is cheaper than retrofitting.
- **Compliance:** GDPR, CCPA, and (where applicable) HIPAA expect data minimization, purpose limitation, and erasure. “We never stored it” or “we only keep what the user chose” simplifies compliance and audits.
- **Blast radius:** If a breach or bug exposes data, optional storage and ephemeral processing limit what can leak. Raw content in memory only during analysis; only structured results and hashes persisted by default.
- **Local-first path:** By not assuming “everything goes to our cloud,” we keep the door open for on-device processing (WASM/ONNX) and on-prem deployments where data never leaves the customer boundary.

### Consequences

- **Positive:** Strong differentiator, easier sales into regulated/enterprise, fewer “we can’t do that” conversations later.
- **Negative:** More code paths (optional storage, consent checks, export/delete workers), stricter rules on logging (no PII/raw content), and we must say “no” to features that require indefinite retention of raw content without explicit consent.
- **Follow-up:** Document data flows and retention in a privacy annex; review all new features against the privacy principles in the Product Vision.

---

## EDL-003: Frontend Framework — React 18+ with Feature-Sliced Structure

**Status:** Accepted  
**Date:** 2026-01

### Context

We needed a frontend stack that could deliver a responsive SPA for dashboards, charts, and forms; support accessibility (WCAG 2.1 AA); and scale to multiple features (auth, conversations, analysis, privacy, settings) without turning into a tangled codebase. SEO and initial load were secondary for the MVP (dashboard behind auth).

### Decision

Use **React 18+** as the core UI framework, with **TanStack Query (React Query)** for server state and **Zustand or Context** for minimal client-only state. Use **Tailwind CSS** with CSS variables for theming and **Recharts or Visx** for time-series and sentiment/clarity visualizations. Structure the app by **feature** (e.g. `auth`, `conversations`, `analysis`, `privacy`, `settings`) with a shared layer for components, hooks, API client, and types. **Next.js** is acceptable where SSR/SSG or improved initial load justify the added dependency; for MVP, a Vite-or-CRA-style SPA is sufficient.

### Rationale

- **React:** Large ecosystem, strong hiring pool, and good fit for data-heavy UIs (forms, tables, charts). React 18 gives concurrent features and a clear upgrade path. Alternatives (Vue, Svelte) were considered; we prioritized ecosystem and team familiarity for speed.
- **TanStack Query:** Server state (conversations, analyses, user settings) is the bulk of our state. React Query gives caching, deduplication, background refetch, and loading/error states without rolling our own. Reduces boilerplate and bugs around “when did we last fetch?”
- **Minimal global client state:** We avoid a heavy global store. Auth and UI preferences are small; feature-local state and URL cover the rest. Zustand or Context keeps the bundle and mental model light.
- **Tailwind + CSS variables:** Fast iteration, consistent spacing/typography, and theming (light/dark, accessibility) without maintaining a large custom CSS or design-token layer. Variables allow future white-label or org-specific themes.
- **Feature-sliced structure:** Aligns with the backend “feature” ownership (conversations, analysis, privacy). Each feature owns its routes, components, hooks, and API surface; shared code stays in `shared/`. Reduces merge conflicts and makes it obvious where to add new flows (e.g. “Slack connect” lives under a feature).
- **Next.js optional:** For MVP, a single SPA is enough. If we add marketing or SEO-critical pages, or need better Core Web Vitals, we can adopt Next.js for those routes and keep the app shell consistent.

### Consequences

- **Positive:** Predictable structure, good DX for async data and theming, easier onboarding.
- **Negative:** We must resist “one more global store” and keep server state in React Query. Chart library choice (Recharts vs Visx) may need revisiting for very large datasets (virtualization).
- **Follow-up:** If we add Next.js, document the routing and data-fetching strategy (RSC vs client) in the frontend section of the System Architecture.

---

## EDL-004: AI API Integration — Cloud-First with Bounded Third-Party Use

**Status:** Accepted  
**Date:** 2026-01

### Context

We need sentiment, clarity, and behavioral analysis. Options ranged from fully in-house (open-source models only) to fully outsourced (third-party APIs for everything). We had to balance quality, cost, latency, privacy, and vendor lock-in.

### Decision

**Sentiment:** Prefer a fine-tuned open-source model (e.g. DistilBERT-based) in our AI layer for control and data sovereignty. Allow **optional** use of a third-party API (e.g. OpenAI) under a strict data-use agreement (no training on our data, minimal retention) where higher quality justifies it; document provider and terms.  
**Clarity:** **Rule-based first** (e.g. Flesch-Kincaid, sentence length, structure); add optional LLM for jargon/ambiguity only where needed. Keeps latency and cost predictable and results explainable.  
**Behavioral:** **Pure heuristics** (message length, response-time deltas, activity patterns); no external API.  
All AI runs in **our** AI Processing Layer (our infra); we do not stream raw conversations to third-party endpoints except under the optional, contractually bounded path above.

### Rationale

- **Privacy and compliance:** Running models in our boundary (cloud or future on-prem) keeps conversation content under our control. Third-party APIs are a risk (retention, training, jurisdiction); we use them only where we have a clear contract and accept the risk explicitly.
- **Cost and predictability:** Rule-based clarity and heuristics are cheap and fast. Full LLM for every message would be expensive and variable in latency; we reserve LLM for specific sub-tasks (e.g. ambiguity detection) if we add them.
- **Explainability:** Users and enterprises want to understand “why did I get this score?” Rules and heuristics are interpretable; we document methodology. Black-box APIs are harder to justify in regulated or coaching contexts.
- **Vendor lock-in:** By owning the pipeline and using open-source or self-hosted models as the default, we can swap or add providers without redesigning the product. Optional API is just one implementation of “sentiment” behind our interface.

### Consequences

- **Positive:** Clear privacy story, predictable cost/latency for most flows, explainable metrics, path to local-first (same pipeline, different runtime).
- **Negative:** Third-party API path requires legal and security review and strict operational controls. We must version and track model versions for reproducibility (e.g. `model_version` in results).
- **Follow-up:** If we add more LLM-backed features (e.g. coaching suggestions), document each provider, data flow, and retention in the AI layer doc and privacy annex.

---

## EDL-005: Async (Batch) Processing Over Real-Time for Analysis

**Status:** Accepted  
**Date:** 2026-01

### Context

Analysis (sentiment, clarity, behavioral) can take on the order of seconds to tens of seconds per conversation. We had to choose between blocking the user until completion (synchronous) or accepting work asynchronously and delivering results later (batch-style with polling or push).

### Decision

Treat conversation analysis as **asynchronous, batch-style work**. The API accepts analysis requests and returns immediately with a job or analysis ID; clients **poll** for status (or optionally receive a webhook/push when complete). We do **not** hold the HTTP request open until analysis finishes. Real-time streaming of analysis (e.g. sentence-by-sentence as the user types) is **out of scope** for MVP and deferred.

### Rationale

- **Latency reality:** AI and aggregation take 5–30+ seconds for non-trivial conversations. Synchronous request-response would lead to timeouts, connection drops, and poor UX. Async avoids long-lived connections and keeps the API stateless and scalable.
- **Resource usage:** Long-running requests tie up connections and threads. With async + a job queue, we can size worker pools to throughput and scale independently. Bursts are absorbed by the queue instead of failing requests.
- **User expectation:** For “upload a conversation and get a report,” users tolerate “we’re analyzing… we’ll notify you” more than a spinner for 30 seconds. Polling or “refresh when ready” is acceptable for MVP; we can add webhooks or SSE later for a smoother feel.
- **Real-time vs batch trade-off:** Real-time streaming would require WebSockets or SSE, chunked processing, and incremental UI updates. It adds complexity and different failure modes (partial results, reconnection). We prioritized “correct, complete result in a few seconds” over “result streamed as you type.” Real-time can be revisited when we have a concrete use case (e.g. live meeting feedback) and capacity to support it.

### Consequences

- **Positive:** Reliable API, no timeouts from analysis, better scalability, simpler client (poll or webhook).
- **Negative:** Clients must implement polling or listen for webhooks; UX must clearly communicate “analysis in progress” and “results ready.” We need a visible queue depth and SLO (e.g. “most analyses complete within N minutes”) for operations.
- **Follow-up:** If we add real-time streaming, document it as a new EDL entry and describe the contract (chunked input, incremental results, backpressure).

---

## EDL-006: Scalability — Stateless Services, Horizontal Scaling, Queue-Based AI

**Status:** Accepted  
**Date:** 2026-01

### Context

We needed to support MVP targets (~10K MAU, ~50K analyses/month, 500 concurrent users, ~100 analyses/hour) without overbuilding, while also ensuring we could grow without a rewrite.

### Decision

- **Stateless API and services:** API Gateway/BFF, Ingest, Orchestrator, and Insights hold no durable state in process; all state is in DB, cache, or queue. This allows **horizontal scaling** behind a load balancer (scale on CPU or request rate).
- **Job queue for analysis:** Analysis work is enqueued; a pool of **AI workers** consumes the queue. Scale workers based on queue depth; use GPU workers only where needed for heavier models.
- **Data layer:** Primary for writes; **read replicas** for dashboard and analytics queries to avoid overloading the primary.
- **Capacity planning:** Size for 3–5 API instances, 2–4 AI workers, single DB + replica at MVP; revisit at ~5× load. Enforce **upload size limits** (e.g. 10MB) and **cursor-based pagination** to avoid unbounded load.

### Rationale

- **Statelessness:** Simplifies deployment (any instance can serve any request), makes failures less sticky (no in-memory session to lose), and aligns with cloud-native scaling (add instances under load).
- **Queue-based AI:** Decouples “accept work” from “do work.” Bursts go into the queue; we scale workers to drain it. We avoid thundering herd on the DB or AI layer from many simultaneous analyses.
- **Read replicas:** Dashboard and trend queries can be read-heavy; offloading them to replicas keeps write path and critical reads fast. We accept eventual consistency for those reads where appropriate.
- **Bounded growth:** Size limits and pagination prevent a single user or query from dominating resources. We document targets so we know when to add capacity or optimize.

### Consequences

- **Positive:** Linear scaling path, clear bottleneck (queue + workers), no single point of failure in app tier.
- **Negative:** We must design for eventual consistency where we use replicas; we need monitoring on queue depth and worker health so we don’t silently fall behind.
- **Follow-up:** Revisit worker sizing and GPU vs CPU mix when we have real latency and cost data. Document auto-scaling triggers and runbooks in operations docs.

---

## EDL-007: Observability — Structured Logs, RED/USE, Distributed Tracing, No PII

**Status:** Accepted  
**Date:** 2026-01

### Context

We needed to operate and debug a distributed flow (API → Orchestrator → AI → DB) and to demonstrate reliability and privacy. Logs and metrics had to be useful for debugging and SLOs without leaking conversation content or PII.

### Decision

- **Logs:** **Structured JSON** with consistent fields: `trace_id`, `span_id`, `user_id`, `tenant_id`, level, message. Centralize in a log aggregation system (e.g. Loki, CloudWatch, Datadog). **Never log PII or raw conversation content;** log resource IDs and event types only.
- **Metrics:** **RED** for APIs (Rate, Error rate, Duration p50/p95/p99) and **USE** for resources (Utilization, Saturation, Errors). Add custom metrics for `analysis_jobs_queued`, `analysis_jobs_completed`, `analysis_jobs_failed`, and `ai_latency_seconds`.
- **Traces:** **Distributed tracing** (OpenTelemetry) across API → Orchestrator → AI → DB. Sample in production (e.g. 10%); **100% for errors** so we can debug failures without replaying PII.
- **Alerting:** Critical alerts on API error rate > 5%, DB connection failures, queue backlog > 1000; warning on AI latency p95 > 30s, disk usage > 80%.
- **Dashboards:** System health (latency, errors, throughput), business (analyses/day, active users), and privacy (export/delete completion time, retention compliance).

### Rationale

- **Structured logs:** Enable querying and correlation without grep-hell. Trace IDs tie logs to requests; tenant/user IDs support tenant-scoped debugging without exposing identity in free text.
- **No PII in logs:** Aligns with privacy-first design and compliance. We get signal from “conversation X analysis failed” and stack traces, not from message content. This is a hard rule in code review.
- **RED/USE:** Standard patterns so we don’t invent metrics. RED covers user-facing APIs; USE covers queues, DB, and workers. Custom analysis metrics tell us pipeline health at a glance.
- **Distributed tracing:** Analysis flows span multiple components. Tracing shows where time is spent (e.g. AI vs DB) and how failures propagate. Sampling keeps cost and volume manageable; full sampling on errors keeps debuggability.
- **Privacy dashboard metrics:** Export/delete completion time and retention compliance are both operational and trust indicators; we expose them in a dedicated view for ops and compliance.

### Consequences

- **Positive:** Debuggable production, clear SLOs and alerts, no PII leakage in observability data, support for compliance and incident response.
- **Negative:** We must enforce “no PII” in logging in code review and tooling (e.g. scrubbers or schema checks). Sampling means we don’t have full request history; we rely on traces and logs for the sampled set and errors.
- **Follow-up:** Define retention for logs and traces (e.g. 30–90 days) and document in runbooks. Consider error-tracking integration (e.g. Sentry) with PII scrubbing if we add it.

---

## Document History

| Version | Date       | Author | Changes                          |
|---------|------------|--------|----------------------------------|
| 1.0     | Jan 31, 2026 | —    | Initial Engineering Decision Log |

---

*New decisions should be added with the next EDL number and the same structure (Context, Decision, Rationale, Consequences). Superseded or deprecated decisions should be marked and linked to the replacing EDL.*
