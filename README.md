# ReflectAI

**Understand how you communicate—without giving up control of your data.**

ReflectAI is a privacy-first AI platform that analyzes conversational data to surface emotional patterns, communication clarity, and behavioral trends. Built for individuals, teams, and organizations who want actionable insight into how they communicate—without sending sensitive data to opaque third-party clouds.

---

## Product Overview

ReflectAI ingests conversation inputs (messaging threads, meeting transcripts, email, or pasted text) and generates insights across three pillars:

| Pillar | What we surface |
|--------|------------------|
| **Emotional intelligence** | Sentiment over time, tone shifts, emotional triggers, aggregate mood. |
| **Communication clarity** | Readability scores, sentence complexity, jargon and ambiguity flags. |
| **Behavioral trends** | Message length distribution, response patterns, activity rhythm. |

The product serves **individual contributors** (self-awareness and growth), **managers** (team sentiment and coaching signals), **coaches and L&D** (anonymized aggregates with consent), and **privacy-conscious enterprises** (on-prem, audit trails, data sovereignty). Revenue is subscription and enterprise—conversation data is never sold or used for advertising.

---

## Architecture Summary

ReflectAI uses a **layered, event-driven architecture** with clear boundaries between presentation, orchestration, AI processing, and data. The system is designed to scale horizontally, support optional local-first processing, and keep privacy and auditability first-class.

```
┌─────────────────────────────────────────────────────────────────┐
│  Clients (Web SPA, API clients, future integrations)            │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  API Gateway / BFF  (auth, rate limit, routing)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
┌──────────┐          ┌──────────────┐          ┌──────────┐
│ Ingest   │          │  Analysis    │          │ Insights │
│ Service  │          │  Orchestrator │          │ Service  │
└────┬─────┘          └──────┬───────┘          └────┬─────┘
     │                       │                       │
     │                       ▼                       │
     │              ┌───────────────┐               │
     │              │ AI Processing │               │
     │              │ (Sentiment,   │               │
     │              │  Clarity,     │               │
     │              │  Behavioral)  │               │
     │              └───────┬───────┘               │
     └──────────────────────┼───────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Data layer (encrypted at rest, tenant-isolated)                 │
└─────────────────────────────────────────────────────────────────┘
```

- **Stateless API and services** — Scale behind a load balancer; state lives in the data layer and job queue.
- **Async analysis** — Conversation analysis runs asynchronously; clients poll or receive push when complete. No long-lived request-response for heavy AI work.
- **Modular monolith** — Service boundaries are explicit (Ingest, Orchestrator, Insights, AI). Deploy as one unit for MVP; split into services when scaling or compliance demands it.
- **Multi-tenancy** — Tenant isolation at the data layer; no cross-tenant access in application logic.

---

## Tech Stack

| Layer | Choices |
|-------|--------|
| **Frontend** | Angular 18+, TypeScript 5.x, standalone components, feature-sliced structure. Charts: ng2-charts / Chart.js. State: Signals + service-based state. |
| **Backend** | Node.js 20+, Express, TypeScript. REST over `/v1`; structured errors; auth via headers (MVP) with path to JWT/session. |
| **Analytics engine** | Standalone TypeScript package: sentiment scoring, tone-shift detection, clarity indicators, emotional trend analysis, behavioral signals, insight summaries. Rule-based/heuristic MVP; adapter-ready for ML/API. |
| **Data** | In-memory repositories for MVP; replace with Postgres (or similar) and encrypted-at-rest in production. |
| **Queue** | Optional job queue for analysis workers; sync processing supported for MVP. |
| **Observability** | Structured JSON logs (traceId, no PII), RED metrics interface, optional OpenTelemetry. |

Repositories: **frontend** (Angular SPA), **backend** (Node API + services), **analytics-engine** (sentiment, clarity, behavioral, trends, summaries). See [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) and [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md).

---

## Screenshots

*Placeholder: add product screenshots here (dashboard, sentiment trends, clarity score, privacy dashboard).*

| Dashboard overview | Sentiment trend | Clarity & insights |
|-------------------|-----------------|--------------------|
| *Screenshot 1*     | *Screenshot 2*  | *Screenshot 3*     |

---

## Future Roadmap

| Phase | Focus |
|-------|--------|
| **2026 H1** | MVP launch (manual import, emotional/clarity/behavioral analysis, privacy dashboard). Beta integrations (Slack, Gmail). Local-first proof of concept. |
| **2026 H2** | General availability, pricing tiers, self-serve signup. Expanded integrations (Teams, Zoom, Outlook). Team tier with aggregated, anonymized insights. AI coaching layer. |
| **2027** | Enterprise tier (on-prem, SSO, audit logs, custom taxonomies). Voice & video tone/pace analysis (opt-in, strict consent). Research & API; vertical plays (coaching, therapy, sales, support). |
| **2028+** | Ecosystem (white-label, marketplace). Predictive insights (misalignment, burnout, conflict signals). Cross-platform intelligence where users opt in. |

Roadmap is product-led; engineering keeps the architecture ready for local-first, on-prem, and multi-region when the business demands it.

---

## Privacy Philosophy

Privacy is not a feature—it’s a constraint that shapes the product and the architecture.

- **Data minimization** — We only collect what’s needed for the analysis the user requested. No surplus metadata or cross-linking without consent.
- **User ownership** — Users own their data. Export and delete are always available; no lock-in.
- **Transparency** — We document what is processed, where, for how long, and by whom. Metrics and methodology are explainable.
- **Local-first option** — Where feasible, processing runs on the user’s device. Cloud is optional; we’re building toward on-device analysis for privacy-sensitive users.
- **No resale or ads** — Conversation data is never sold or used for advertising. Revenue is subscriptions and enterprise licensing.
- **Auditability** — Enterprise deployments get audit logs for data access, retention, and sharing. Compliance-ready for GDPR, CCPA, HIPAA (where applicable), and SOC 2.

In the codebase: optional raw content persistence, content hashing for dedup (no plaintext in logs), ephemeral AI input (in-memory only; not logged), tenant isolation, and structured logging that never includes PII or conversation content.

---

## System Design Highlights

- **Modular architecture** — Clear boundaries (API, services, AI, data) and explicit ownership. Same boundaries support a single deploy today and per-service deploys later without a rewrite.
- **Privacy by design** — Optional raw storage, content hash for idempotency, no content in logs, tenant-scoped queries. Architecture supports local-first and on-prem.
- **Async, queue-friendly analysis** — Analysis is job-based; API stays responsive. Workers can scale independently; we avoid long-lived request-response for AI.
- **Observability** — Structured logs (traceId, spanId, no PII), RED metrics for APIs, pluggable metrics and tracing. We know what’s slow or broken without leaking sensitive data.
- **Testability** — Unit tests (services, lib, AI pipelines), integration tests (API + in-memory repos), AI output validation (shape, bounds, determinism), and performance scripts. See [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md).

---

## Repository Structure

```
ReflectAI/
├── frontend/           # Angular SPA: layout (header, sidebar), dashboard, conversations (list, detail, upload), analysis (detail, sentiment chart, clarity)
├── backend/            # Node.js API: /v1/conversations, /v1/analyses, /v1/insights/overview, ingest, orchestrator, AI integration
├── analytics-engine/   # Sentiment, clarity, behavioral, trends, insight summaries
├── docs/               # Product vision, system architecture, EDL, frontend/backend/folder docs, testing strategy
├── tests/              # Fixtures, performance scripts (k6 + Node)
└── config/             # Env and CI (optional)
```

**Frontend routes:** `/dashboard` (overview, trend chart, recent analyses), `/conversations` (list), `/conversations/upload` (new conversation + auto analysis), `/conversations/:id` (detail + “Analyze”), `/analysis/:id` (analysis detail with sentiment, clarity, behavioral, chart). See [Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md) and [COMPONENTS](frontend/src/app/COMPONENTS.md).

Deep dives: [Product Vision](docs/PRODUCT_VISION.md), [System Architecture](docs/SYSTEM_ARCHITECTURE.md), [Engineering Decision Log](docs/ENGINEERING_DECISION_LOG.md), [Testing Strategy](docs/TESTING_STRATEGY.md), [Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md), [Backend Architecture](docs/BACKEND_ARCHITECTURE.md), [Folder Structure](docs/FOLDER_STRUCTURE.md).

---

## Quick Start

**Install all dependencies** (from repo root): `npm run install:all`

**Backend** (starts on port 3000; seeds demo data on startup)

```bash
cd backend && npm install && npm run build && npm start
```

**Frontend** (starts on port 4200; proxies `/api` to backend; sends demo user headers)

```bash
cd frontend && npm install && npm start
```

Then open **http://localhost:4200**. The backend seeds 2 conversations and 2 completed analyses for user `demo-user` so you can see all components with data: **Dashboard** (overview, trend chart, recent analyses), **Conversations** (list with 2 items), **Conversation detail** (click a conversation), **Analysis detail** (click an analysis from dashboard or recent list; shows sentiment, clarity, behavioral, sentiment-by-message chart).

**Analytics engine** (standalone package)

```bash
cd analytics-engine && npm install && npm run build
```

**API base:** Frontend calls `/api/v1` by default (conversations, analyses, insights/overview). Backend uses `x-user-id` and `x-tenant-id` headers for auth (MVP). Set `STORE_RAW_CONTENT_DEFAULT=true` (or use dev default) so analysis can read conversation content. See [Backend Architecture](docs/BACKEND_ARCHITECTURE.md) and [Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md).

---

## License

Proprietary. All rights reserved.
