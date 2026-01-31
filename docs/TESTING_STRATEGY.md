# ReflectAI — Testing Strategy

**Version:** 1.0  
**Last Updated:** January 31, 2026  
**Audience:** Engineering, QA  
**Companion:** [System Architecture](./SYSTEM_ARCHITECTURE.md), [Engineering Decision Log](./ENGINEERING_DECISION_LOG.md)

This document describes the testing strategy for ReflectAI: unit tests, integration tests, AI processing validation, and performance testing. The goal is to maintain quality, privacy guarantees, and reliability without logging PII or raw conversation content.

---

## 1. Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E (few)     │  Critical user flows
                    ├─────────────────┤
                    │  Integration    │  API + services + DB/queue
                    │  (moderate)     │
                    ├─────────────────┤
                    │  Unit (many)    │  Services, AI pipelines, utils
                    └─────────────────┘
```

- **Unit tests** — Fast, isolated; mock external deps. Cover business logic, AI pipelines, privacy helpers.
- **Integration tests** — API + services + in-memory or test DB; no external APIs. Cover flows (upload → analysis → insights).
- **AI processing validation** — Deterministic checks on AI output shape and bounds; regression on known inputs.
- **Performance tests** — Throughput, latency, resource use; run in CI or on-demand.

---

## 2. Unit Tests

### 2.1 Scope

| Layer | What to test | Tools |
|-------|--------------|--------|
| **Backend services** | IngestService, OrchestratorService, InsightsService: create/list/get with mocked repositories | Jest / Vitest |
| **Backend lib** | Logger (no PII), privacy (contentHash, sanitizeForLog), trace | Jest / Vitest |
| **Backend API** | Route handlers with mocked services; validation middleware; error middleware | Jest / Vitest + supertest |
| **Analytics-engine** | Scorer, aggregate, tone-shift detector, clarity indicators, emotional trend, behavioral signals, insight summaries | Jest / Vitest |
| **Frontend** | Components (inputs/outputs), services (mocked HTTP), pipes | Jasmine/Karma or Jest (Angular) |

### 2.2 Principles

- **No PII in test logs** — Use fixture IDs and lengths, not real conversation content, in assertions and log expectations.
- **Deterministic** — Same input ⇒ same output for AI pipelines; no flaky time or random in assertions.
- **Isolated** — One unit per test file; mock repositories, queue, and HTTP.
- **Naming** — `describe('ServiceName')`, `it('should do X when Y')` or `test('behavior description')`.

### 2.3 Backend Unit Examples

- **IngestService:** Given tenantId, userId, content → returns conversation with id; contentHash computed; no raw content in log mock.
- **privacy.contentHash:** Same string → same hash; different string → different hash.
- **privacy.sanitizeForLog:** Object with `content` key → key omitted in output.
- **validate.middleware:** Invalid body → throws AppError with 400; valid body → next() called.
- **error.middleware:** AppError → correct status and body; unknown error → 500 and INTERNAL_ERROR.

### 2.4 Analytics-Engine Unit Examples

- **scoreSegment:** Positive phrase → score > 0, label 'positive'; negative phrase → score < 0; empty → neutral.
- **aggregateSentiment:** Mixed scores → correct overallScore and ratios.
- **detectToneShifts:** Consecutive segments with large delta → one shift; magnitude below threshold → no shift.
- **generateClarityIndicators:** Known text → expected readability band, word count.
- **analyzeEmotionalTrend:** Improving scores → direction 'improving'; stable → 'stable'.
- **computeClarityScore:** High readability, low jargon → score ≥ 80, grade A or B.
- **buildInsightSummaries:** Given trend + clarity + behavioral → at least one summary per type when applicable.

### 2.5 Frontend Unit Scope (Current Implementation)

| Component / Service | What to test |
|---------------------|--------------|
| **ConversationService** | create/list/getById with mocked HttpClient; error handling (empty/fallback). |
| **AnalysisService** | create/getById with mocked HttpClient; error handling. |
| **DashboardService** | getOverview with mocked HttpClient; fallback on error. |
| **ConversationListComponent** | Loads list on init; displays items; empty and loading states; formatDate. |
| **ConversationDetailPageComponent** | Loads conversation by route id; startAnalysis creates analysis and navigates; error states. |
| **ConversationUploadPageComponent** | onSubmitted creates conversation then analysis, navigates to analysis or shows error; submitting state. |
| **AnalysisDetailPageComponent** | Loads analysis by id; polling until completed/failed; trendPoints from scores; formatDate; behavioral display. |
| **SentimentTrendVisualizationComponent** | Renders bars from data; ratios; legend; accessibility. |
| **AnalysisStatusComponent** | Renders badge for pending/running/completed/failed. |
| **SentimentSummaryComponent** | Renders aggregate, labels, count from analysis.results.sentiment. |
| **ClarityMetricsComponent** | Renders readability, flags from analysis.results.clarity. |

### 2.6 Location

- **Backend:** `backend/src/**/*.test.ts` or `backend/__tests__/` (colocated or top-level).
- **Analytics-engine:** `analytics-engine/src/**/*.test.ts` or `analytics-engine/__tests__/`.
- **Frontend:** Per Angular conventions: `*.spec.ts` next to components/services.

---

## 3. Integration Tests

### 3.1 Scope

| Flow | Description | Boundaries |
|------|-------------|------------|
| **Conversation ingest** | POST /v1/conversations with valid body → 201, conversation id; GET by id → 200 | API + IngestService + in-memory repo |
| **Conversation list** | GET /v1/conversations with cursor/limit → 200, data array, next_cursor? | API + IngestService |
| **Analysis lifecycle** | POST /v1/analyses with conversation_id → 202; GET /v1/analyses/:id → 200, status eventually completed, results (sentiment, clarity, behavioral) present | API + Orchestrator + repos + AI (sync in test) |
| **Insights overview** | GET /v1/insights/overview → 200, analyses_count, completed_count, recent_analyses[], trend_buckets?[] | API + InsightsService + repo |
| **Auth** | Request without x-user-id → 401 | API middleware |
| **Validation** | POST with oversized or invalid body → 400 | API + validate middleware |

### 3.2 Principles

- **No external services** — Use in-memory repositories and sync AI (no real queue in CI unless needed).
- **No PII in fixtures** — Use minimal synthetic content (e.g. "test message one", "test message two"); never production data.
- **Clean state** — Each test uses a fresh repo or clears state; no cross-test leakage.
- **Idempotency** — Same idempotency_key → same analysis id on repeat POST.

### 3.3 Setup

- **Backend:** Start Express app with test config (e.g. in-memory repos, sync analysis). Use supertest: `request(app).post('/v1/conversations').set('x-user-id', 'test-user').send({ content: '...' })`.
- **Auth:** Set `x-user-id` and optionally `x-tenant-id` for authenticated tests.
- **Fixtures:** Shared fixtures in `tests/fixtures/` (e.g. valid conversation body, expected analysis result shape).

### 3.4 Location

- **Backend:** `backend/src/**/*.integration.test.ts` or `backend/tests/integration/`.
- **Shared fixtures:** `tests/fixtures/` at repo root.

---

## 4. AI Processing Validation

### 4.1 Goals

- **Output shape** — Every AI pipeline and the analytics-engine return typed structures (scores, labels, clarity, behavioral); tests assert shape and types.
- **Bounds** — Sentiment score in [-1, 1]; clarity score in [0, 100]; ratios in [0, 1]; no NaN/Infinity.
- **Determinism** — Same input ⇒ same output across runs (for rule-based and heuristic pipelines).
- **Regression** — A fixed set of inputs (golden set) produces expected outputs; changes to pipelines must update golden files or fail.

### 4.2 What to Validate

| Component | Assertions |
|-----------|------------|
| **Sentiment scorer** | score ∈ [-1, 1]; label ∈ { positive, negative, neutral }; empty input → neutral. |
| **Clarity indicators** | readability, avgSentenceLength, wordCount ≥ 0; ambiguityFlags array. |
| **Clarity score** | score ∈ [0, 100]; grade ∈ { A, B, C, D, F }. |
| **Tone shift detector** | magnitude ≥ 0; direction ∈ { improving, declining, neutral }; fromIndex < toIndex. |
| **Emotional trend** | direction ∈ { improving, declining, stable }; strength ∈ [0, 1]; volatility ∈ [0, 1]. |
| **Behavioral signals** | ratios ∈ [0, 1]; segmentCount ≥ 0; boolean flags consistent with ratios. |
| **Insight summaries** | Each summary has type, summary string; severity when present ∈ { high, medium, low }. |

### 4.3 Golden / Snapshot Tests

- **Golden inputs** — Store in `tests/fixtures/ai/` (e.g. `simple-positive.txt`, `mixed-sentiment.txt`, `long-complex.txt`).
- **Golden outputs** — Optional: snapshot or JSON file of expected result for each golden input; run analytics-engine and diff. Update snapshots explicitly when behavior is intentionally changed.
- **No PII** — Golden content is synthetic only.

### 4.4 Location

- **Analytics-engine:** `analytics-engine/__tests__/ai-validation.test.ts` or under `src/**/*.validation.test.ts`.
- **Backend AI layer:** `backend/src/ai/**/*.test.ts` for pipeline shape and bounds.
- **Fixtures:** `tests/fixtures/ai/`.

---

## 5. Performance Testing

### 5.1 Goals

- **Throughput** — Requests per second for POST /v1/conversations and POST /v1/analyses (and GETs) under target load.
- **Latency** — p50, p95, p99 for API endpoints; analysis job completion time when run synchronously or via queue.
- **Resource use** — Memory and CPU during sustained load; no leaks over time.
- **Baseline** — Establish baselines for CI or nightly runs; alert on regression.

### 5.2 Scope

| Scenario | Metric | Target (MVP example) |
|----------|--------|----------------------|
| **API health** | GET /health p99 | < 100 ms |
| **Conversation create** | POST /v1/conversations p95 | < 500 ms |
| **Analysis create** | POST /v1/analyses p95 | < 300 ms (enqueue only) |
| **Analysis get** | GET /v1/analyses/:id p95 | < 200 ms |
| **Analysis full run** | Time to status=completed (sync) | < 30 s for typical conversation |
| **Throughput** | POST /v1/conversations sustained | ≥ 50/s per instance |

### 5.3 Approach

- **Tooling** — k6, Artillery, or Node script with concurrent requests. Prefer k6 for scripting and thresholds.
- **Environment** — Dedicated test env or CI runner; in-memory or test DB to avoid production impact.
- **Load profile** — Ramp-up, sustained, ramp-down; optional spike test.
- **No PII** — Use synthetic payloads; do not log request bodies in perf runs.

### 5.4 Implementation

- **Scripts:** `tests/performance/` — e.g. `conversations.js` (k6 script for POST/GET conversations), `analyses.js` (create + poll until completed).
- **Config:** `tests/performance/config.json` or env — base URL, duration, VUs, thresholds.
- **CI:** Optional: run perf suite on schedule or on release tag; fail if thresholds regress.

### 5.5 Location

- **Scripts:** `tests/performance/` (k6 or Artillery scripts).
- **Config:** `tests/performance/config.*`.
- **Results:** Output to `tests/performance/results/` (gitignored) or CI artifacts.

---

## 6. Test Data and Privacy

- **Fixtures** — Synthetic only: "Segment one.", "Segment two.", or generated lorem ipsum. Never copy production or real user content.
- **Logs** — Tests that verify logging must assert on presence/absence of fields (e.g. traceId, conversationId), not on raw content. No assertion that `content` appears in logs.
- **Sanitizers** — Unit tests for sanitizeForLog ensure PII/content keys are stripped.
- **Audit** — If tests ever need to simulate audit logs, use resource IDs and actor IDs only.

---

## 7. CI Integration

- **Unit + integration** — Run on every PR and main: `npm run test` (backend), `npm run test` (analytics-engine), `ng test` (frontend).
- **AI validation** — Part of analytics-engine (and backend AI) test suite; run in CI.
- **Performance** — Optional: run on main nightly or on release; store results as artifacts; fail on threshold regression.
- **Coverage** — Optional: collect coverage for backend and analytics-engine; fail if below threshold (e.g. 80% for critical paths).

---

## 8. Summary

| Type | Scope | Location | When |
|------|--------|----------|------|
| **Unit** | Services, lib, API handlers, AI pipelines, analytics-engine modules | Colocated `*.test.ts` or `__tests__/` | Every PR |
| **Integration** | API + services + repos (in-memory), full flows | Backend `integration/` or `*.integration.test.ts` | Every PR |
| **AI validation** | Output shape, bounds, determinism, golden inputs | analytics-engine + backend AI + `tests/fixtures/ai/` | Every PR |
| **Performance** | Throughput, latency, thresholds | `tests/performance/` | Nightly or on release |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 31, 2026 | Initial testing strategy |
| 1.1 | Jan 31, 2026 | Frontend unit scope: ConversationService, AnalysisService, DashboardService; ConversationList/Detail/Upload, AnalysisDetail, SentimentTrend, AnalysisStatus, SentimentSummary, ClarityMetrics. Integration: conversation list, insights overview; analysis results (sentiment, clarity, behavioral). |
