# ReflectAI — Folder Structure

**Version:** 1.0  
**Last Updated:** January 31, 2026  
**Companion:** [System Architecture](../SYSTEM_ARCHITECTURE.md)

This document describes the purpose of each top-level folder and how the codebase is organized for scalability and clear ownership.

---

## Overview

```
ReflectAI/
├── frontend/           # Web app (SPA), Angular + TypeScript
├── backend/            # API gateway, services, shared server logic
├── analytics-engine/   # AI processing: sentiment, clarity, behavioral pipelines
├── docs/               # Product, architecture, runbooks, and folder docs
├── tests/              # E2E, integration, and shared test fixtures
├── config/             # Environment configs, CI/CD, and infra config
├── PRODUCT_VISION.md
├── SYSTEM_ARCHITECTURE.md
└── ENGINEERING_DECISION_LOG.md
```

---

## 1. `frontend/`

**Purpose:** All client-side code for the ReflectAI web application (Angular SPA). Owns UI, client state, API integration, and user-facing flows (upload conversations, sentiment insights, dashboard analytics).

**Contents:**

| Path | Purpose |
|------|---------|
| `src/app/core/` | Singletons: auth service/guard/interceptor, HTTP interceptors (base URL, errors). |
| `src/app/shared/` | Shared components (insight-card, privacy-notice), pipes, directives; reusable across features. |
| `src/app/features/` | Feature modules: conversations (conversation-input, list, **conversation-meta**, **conversation-analysis-action**, detail-page, **upload-instructions**, **upload-hint**, upload-page; ConversationService), analysis (analysis-status, sentiment-summary, clarity-metrics, sentiment-trend-visualization, analysis-detail-page; AnalysisService), dashboard (dashboard-layout, analytics-overview, recent-analyses, trend-charts, dashboard; DashboardService). |
| `src/app/layout/` | App shell: main-layout, header, sidebar (menu: Dashboard, Conversations, New conversation). |
| `src/app/models/` | TypeScript interfaces (Conversation, Analysis, API responses, dashboard/insights). |
| `src/assets/` | Static assets (favicon, manifest, etc.). |

**Why this structure:** Angular conventions (core/shared/features) with lazy-loaded feature modules. See [Frontend Architecture](./FRONTEND_ARCHITECTURE.md) for component structure, services, state, API layer, and charts.

**Scaling:** Add new feature modules under `features/`; keep shared code in `shared/`. Path aliases (`@app/core`, `@app/features/*`) keep imports clean.

---

## 2. `backend/`

**Purpose:** Node.js server-side API, business services, AI integration, and shared server logic. Handles auth, rate limiting, request validation, ingestion, analysis orchestration, and serving insights. See [Backend Architecture](./BACKEND_ARCHITECTURE.md).

**Contents:**

| Path | Purpose |
|------|---------|
| `src/api/routes/` | REST routes: conversations, analyses, insights, users (export/delete). |
| `src/api/middleware/` | Observability, auth, rate limit, validation, error handler. |
| `src/services/` | Ingest, orchestrator, insights (modular services). |
| `src/ai/` | AI integration: preprocessing, sentiment/clarity/behavioral pipelines. |
| `src/repositories/` | Conversation and analysis stores (tenant-scoped; MVP in-memory). |
| `src/lib/` | Logger (no PII), metrics, privacy (hash, sanitize), trace. |
| `src/config/` | Env-based config. |

**Why this structure:** Clear boundary between API layer and services; AI layer has no HTTP/DB; privacy-first (optional raw storage, content hash, no content in logs). Observability hooks (traceId, structured logs, metrics interface) throughout.

**Scaling:** Add new services under `services/`; swap repositories for Postgres; add queue for async analysis workers; implement metrics with OpenTelemetry/StatsD.

---

## 3. `analytics-engine/`

**Purpose:** AI and analysis logic only: sentiment, clarity, and behavioral pipelines. Consumed by the backend orchestrator; no direct HTTP or DB access from here.

**Contents:**

| Path | Purpose |
|------|---------|
| `pipelines/sentiment/` | Sentiment pipeline: normalization, model invocation (or API adapter), emotional labels, aggregation. |
| `pipelines/clarity/` | Clarity pipeline: readability (e.g. Flesch-Kincaid), sentence complexity, jargon/ambiguity (rules + optional LLM). |
| `pipelines/behavioral/` | Behavioral pipeline: message length, response-time deltas, activity patterns (heuristics only). |
| `models/` | Model adapters and versioning: wrapper around open-source or third-party models; no raw conversation logging. |
| `shared/` | Shared pipeline code: preprocessing, aggregation helpers, output schema, model versioning. |

**Why this structure:** Keeps AI logic isolated from API and persistence. Same pipelines can be run in cloud workers or (future) local-first runtime. Clear ownership per analysis type.

**Scaling:** Add new pipelines (e.g. `pipelines/coaching/`) or new model backends under `models/`. Local-first can add `runtimes/wasm/` or `runtimes/onnx/` that reuse the same pipeline interfaces.

---

## 4. `docs/`

**Purpose:** Central place for product, architecture, operations, and onboarding documentation (excluding code-level comments).

**Contents:**

- **Product & architecture:** Links or copies of product vision, system architecture, engineering decision log (these can live at repo root and be linked).
- **Runbooks:** Operational playbooks (deploy, rollback, incident response, export/delete SLA).
- **API contracts:** OpenAPI specs or similar, if not generated from code.
- **Folder structure:** This document (`FOLDER_STRUCTURE.md`).
- **Onboarding:** Setup, env vars, local dev, testing.

**Why this structure:** Single place for “how the system works” and “how we run it.” Reduces tribal knowledge and speeds up new hires and on-call.

**Scaling:** Add subfolders (e.g. `docs/runbooks/`, `docs/api/`, `docs/onboarding/`) as docs grow. Keep a minimal index or README in `docs/` that points to key artifacts.

---

## 5. `tests/`

**Purpose:** Cross-cutting and integration tests that span multiple parts of the stack, plus shared test fixtures and helpers.

**Contents:**

| Path | Purpose |
|------|---------|
| `fixtures/` | Shared test data: conversation payloads (`conversations.json`), AI golden inputs (`ai/*.txt`). |
| `performance/` | Performance test scripts (k6 + Node fallback), config, README. Run against local/test backend. |
| `e2e/` | (Optional) End-to-end tests: full flows against a running stack. |
| `integration/` | (Optional) Cross-repo integration; backend integration tests live in `backend/tests/integration/`. |

**Why this structure:** E2E and integration tests are often run from a single place (e.g. CI) and need a clear home. Fixtures live once and are reused so changes to schema or formats don’t scatter across repos. Unit tests typically live next to the code they test (e.g. `frontend/src/features/conversations/__tests__/`); `tests/` is for tests that cross boundaries.

**Scaling:** Add e2e, contract, or load profiles under `performance/` as needed. See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md).

---

## 6. `config/`

**Purpose:** Environment-specific configuration, CI/CD definitions, and infrastructure-as-code (or pointers to it). No secrets in repo; config holds structure and non-secret defaults.

**Contents:**

| Path | Purpose |
|------|---------|
| `env/` | Environment config files or templates (e.g. `.env.example`, env-specific JSON/YAML). Documents required vars and non-secret defaults. |
| `ci/` | CI/CD pipeline definitions (e.g. GitHub Actions, GitLab CI). Build, test, lint, and deploy steps. |

**Why this structure:** Separates “what the app needs per environment” (env/) from “how we build and deploy” (ci/). Infra (Terraform, Pulumi) can live here under `config/infra/` or in a dedicated repo; either way, config is the place for deploy-time and environment shape.

**Scaling:** Add `config/infra/` for Terraform/Pulumi, or `config/k8s/` for Kubernetes manifests. Keep secrets in a vault; config references them by name or key path, never by value.

---

## Summary

| Folder | Owner focus | Scales by |
|--------|-------------|-----------|
| **frontend** | UI, client state, features | New feature folders; optional `mobile/` or separate app repo |
| **backend** | API, services, shared server | New services; later split into deployable units |
| **analytics-engine** | AI pipelines, models | New pipelines; new runtimes (e.g. local-first) |
| **docs** | Product, architecture, ops | Subfolders (runbooks, api, onboarding) |
| **tests** | E2E, integration, fixtures | New test types (e.g. performance, contract) |
| **config** | Env, CI, infra | New envs; new pipelines; infra as code |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 31, 2026 | Initial folder structure and doc |
| 1.1 | Jan 31, 2026 | Frontend paths updated: conversations (conversation-input, list, detail-page, upload-page), analysis (analysis-status, sentiment-summary, clarity-metrics, sentiment-trend-visualization, analysis-detail-page), dashboard (layout, overview, recent-analyses, trend-charts), layout (main-layout, header, sidebar). |
