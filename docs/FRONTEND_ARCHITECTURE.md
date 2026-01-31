# ReflectAI — Frontend Application Architecture (Angular + TypeScript)

**Version:** 1.0  
**Last Updated:** January 31, 2026  
**Stack:** Angular 18+, TypeScript 5.x  
**Companion:** [System Architecture](./SYSTEM_ARCHITECTURE.md)

This document describes the Angular-based frontend architecture for ReflectAI, covering component structure, services, state management, API integration, chart visualization, and scalability. The app supports **uploading conversation text**, **viewing sentiment insights**, and **dashboard analytics**.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REFLECTAI FRONTEND (Angular SPA)                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│   │   Shell     │    │  Feature    │    │   Shared    │                  │
│   │   (Layout,  │    │  Modules    │    │   (UI,      │                  │
│   │   Nav, Auth)│    │  Upload,    │    │   Pipes,    │                  │
│   │             │    │  Insights,  │    │   Directives)                  │
│   │             │    │  Dashboard  │    │             │                  │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                  │
│          │                  │                  │                         │
│          └──────────────────┼──────────────────┘                         │
│                             │                                            │
│   ┌─────────────────────────▼─────────────────────────┐                 │
│   │              State (Signals / NgRx)                │                 │
│   │   Conversations │ Analyses │ User │ UI             │                 │
│   └─────────────────────────┬─────────────────────────┘                 │
│                             │                                            │
│   ┌─────────────────────────▼─────────────────────────┐                 │
│   │           API Integration Layer                   │                 │
│   │   HTTP Client │ Interceptors │ Error Handler      │                 │
│   └─────────────────────────┬─────────────────────────┘                 │
│                             │                                            │
│   ┌─────────────────────────▼─────────────────────────┐                 │
│   │           Backend REST API (/v1/...)             │                 │
│   └─────────────────────────────────────────────────┘                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Structure

### 2.1 Folder Layout (Angular Conventions)

```
frontend/src/app/
├── core/                    # Singletons, app-wide (imported once in AppModule)
│   ├── auth/
│   │   ├── auth.guard.ts
│   │   ├── auth.interceptor.ts
│   │   └── auth.service.ts
│   ├── http/
│   │   ├── api-prefix.interceptor.ts
│   │   └── error.interceptor.ts
│   └── core.module.ts
│
├── shared/                   # Reusable UI and utilities (imported by many features)
│   ├── components/
│   │   ├── button/
│   │   ├── card/
│   │   ├── loading-spinner/
│   │   ├── empty-state/
│   │   └── page-header/
│   ├── pipes/
│   ├── directives/
│   ├── shared.module.ts
│   └── index.ts
│
├── features/
│   ├── conversations/       # Upload, list, detail conversations
│   │   ├── components/
│   │   │   ├── conversation-input/
│   │   │   ├── conversation-list/
│   │   │   ├── conversation-meta/
│   │   │   ├── conversation-analysis-action/
│   │   │   ├── conversation-detail-page/
│   │   │   ├── upload-instructions/
│   │   │   ├── upload-hint/
│   │   │   └── conversation-upload-page/
│   │   ├── services/
│   │   │   └── conversation.service.ts
│   │   └── index.ts
│   │
│   ├── analysis/            # Sentiment insights & analysis status
│   │   ├── components/
│   │   │   ├── analysis-status/
│   │   │   ├── sentiment-summary/
│   │   │   ├── sentiment-trend-visualization/
│   │   │   ├── clarity-metrics/
│   │   │   └── analysis-detail-page/
│   │   ├── services/
│   │   │   └── analysis.service.ts
│   │   └── index.ts
│   │
│   └── dashboard/           # Dashboard analytics
│       ├── components/
│       │   ├── dashboard-layout/
│       │   ├── analytics-overview/
│       │   ├── trend-charts/
│       │   └── recent-analyses/
│       ├── services/
│       │   └── dashboard.service.ts
│       ├── dashboard-routing.module.ts
│       ├── dashboard.module.ts
│       └── index.ts
│
├── layout/                  # App shell
│   ├── main-layout/
│   │   ├── main-layout.component.ts
│   │   ├── main-layout.component.html
│   │   └── main-layout.component.scss
│   ├── header/
│   ├── sidebar/
│   └── layout.module.ts
│
├── models/                  # TypeScript interfaces (or in shared/models)
│   ├── conversation.model.ts
│   ├── analysis.model.ts
│   └── api-response.model.ts
│
├── app.component.ts
├── app.config.ts            # Standalone app config: providers, routes
├── app.routes.ts
└── index.html
```

### 2.2 Component Roles

| Layer | Purpose | Example |
|-------|---------|--------|
| **Shell / Layout** | App frame, nav, auth-gated outlet | `MainLayoutComponent`, `HeaderComponent`, `SidebarComponent` |
| **Feature containers** | Smart components: bind state, call services, handle routing | `ConversationListComponent`, `DashboardLayoutComponent` |
| **Feature presentational** | Dumb components: inputs/outputs, no direct API | `ConversationUploadComponent`, `SentimentChartComponent` |
| **Shared** | Reusable across features | `LoadingSpinnerComponent`, `EmptyStateComponent`, `PageHeaderComponent` |

### 2.3 Key Screens (Implemented)

| Screen | Route | Feature | Description |
|--------|-------|---------|-------------|
| Dashboard | `/dashboard` | dashboard | Analytics overview (counts, completion rate), trend chart (sentiment by day), recent analyses with links to `/analysis/:id`. Privacy notice (dismissible). |
| Conversation list | `/conversations` | conversations | List conversations from API; cards with id prefix, date, source; link to `/conversations/:id`. |
| New conversation | `/conversations/upload` | conversations | Textarea (max 50k chars), character count, submit → create conversation + analysis → redirect to `/analysis/:id`. Submitting state on button; hint and link to Conversations. |
| Conversation detail | `/conversations/:id` | conversations | Full ID, created, source. “Analyze conversation” starts analysis and redirects to `/analysis/:id`. Nav: Back to list, Dashboard. |
| Analysis detail | `/analysis/:id` | analysis | Load analysis; poll every 2s until completed/failed. Shows status, created/completed dates. When completed: sentiment summary, clarity metrics, behavioral (avg message length), sentiment-by-message chart (description + legend; empty state if no scores). Nav: Dashboard, Conversations. |

---

## 3. Service Architecture

### 3.1 Service Layers

| Layer | Responsibility | Location | Scope |
|-------|----------------|----------|--------|
| **API services** | HTTP calls to backend; map DTOs to domain models | `core/` or feature `services/` | One service per resource or aggregate |
| **Domain / feature services** | Business logic, orchestration (e.g. upload then create analysis) | `features/*/services/` | Feature-scoped |
| **Core services** | Auth, session, app config | `core/` | Singleton |

### 3.2 Service Map

| Service | Location | Purpose |
|---------|----------|---------|
| `AuthService` | `core/auth/` | Login, logout, token refresh, current user |
| `ConversationService` | `features/conversations/services/` | `POST /v1/conversations`, `GET /v1/conversations`, get by id |
| `AnalysisService` | `features/analysis/services/` | `POST /v1/analyses`, `GET /v1/analyses/{id}`, poll status |
| `InsightsService` or `DashboardService` | `features/dashboard/services/` | `GET /v1/insights` or aggregates for dashboard |
| `ExportService` | `features/privacy/services/` (future) | `POST /v1/users/me/export` |

### 3.3 Patterns

- **Inject HttpClient only in API-facing services;** components inject feature services.
- **Return Observables** from services; components subscribe or use `async` pipe.
- **Use interceptors** for base URL, auth header, and global error handling; keep services free of URL/header boilerplate.
- **Typed responses:** Use interfaces for API responses (e.g. `Conversation`, `Analysis`, `PaginatedResponse<T>`).

---

## 4. State Management

### 4.1 Strategy: Angular Signals + Lightweight Store (Option A) or NgRx (Option B)

**Recommendation for MVP:** **Angular Signals** with **service-based state** (BehaviorSubject or `signal()` in services). Add **NgRx** only if you need time-travel debugging, strict unidirectional flow, or very complex shared state.

| Approach | When to use |
|----------|-------------|
| **Signals + service state** | MVP: conversations list, current analysis, user prefs. Simple, few dependencies. |
| **NgRx (Store, Effects)** | Many features sharing the same data; need consistent caching and invalidation; complex async flows. |

### 4.2 State Shape (Conceptual)

```ts
// Conceptual — adapt to Signals or NgRx
interface AppState {
  auth: { user: User | null; token: string | null };
  conversations: { list: Conversation[]; selectedId: string | null; loading: boolean };
  analyses: { byId: Record<string, Analysis>; loading: Record<string, boolean> };
  dashboard: { overview: DashboardOverview | null; recentAnalyses: Analysis[]; loading: boolean };
  ui: { sidebarOpen: boolean; theme: 'light' | 'dark' };
}
```

### 4.3 Data Flow

- **Upload flow:** User submits text → `ConversationService.create()` → API returns `conversation_id` → optionally `AnalysisService.create(conversation_id)` → store analysis job id → poll or navigate to analysis view.
- **Insights flow:** User opens analysis view → `AnalysisService.getById(id)` → poll until `status === 'completed'` → display results; optionally cache in state.
- **Dashboard:** On load, `DashboardService.getOverview()` and `getRecentAnalyses()` → store in state; charts read from state or from service observables.

### 4.4 Caching and Invalidation

- **Conversations list:** Cache in feature service; invalidate after upload or delete.
- **Analysis by id:** Cache per id; invalidate when status moves to `completed` (or on manual refresh).
- **Dashboard:** Short TTL (e.g. 5 min) or invalidate on navigation to dashboard; no PII in URLs (use ids only).

---

## 5. API Integration Layer

### 5.1 HTTP Client Setup

- **Base URL:** From `environment.apiUrl` (e.g. `https://api.reflectai.com/v1` or `/api/v1` for same-origin).
- **Versioning:** All requests go to `/v1/`; prefix applied in interceptor.

### 5.2 Interceptors (Order Matters)

| Interceptor | Order | Purpose |
|-------------|-------|---------|
| `ApiPrefixInterceptor` | First | Prepend base URL and `/v1`. |
| `AuthInterceptor` | Second | Add `Authorization: Bearer <token>`. |
| `ErrorInterceptor` | Last | Map 401 → logout/redirect; 4xx/5xx → user-friendly message; optionally log. |

### 5.3 API Contract (Aligned with Backend)

| Method | Endpoint | Request | Response | Use case |
|--------|----------|---------|----------|----------|
| POST | `/v1/conversations` | `{ content: string }` or multipart | `{ id, ... }` | Upload conversation |
| GET | `/v1/conversations` | `?cursor=&limit=` | `{ data: Conversation[], next_cursor? }` | List conversations |
| GET | `/v1/conversations/:id` | — | `Conversation` | Conversation detail |
| POST | `/v1/analyses` | `{ conversation_id, idempotency_key? }` | `{ id, status, ... }` | Create analysis job |
| GET | `/v1/analyses/:id` | — | `Analysis` (status, results when completed) | Poll analysis status & get insights |
| GET | `/v1/insights/overview` or similar | — | Dashboard aggregates | Dashboard analytics |

### 5.4 Models (TypeScript Interfaces)

```ts
// conversation.model.ts
export interface Conversation {
  id: string;
  user_id: string;
  source: 'manual' | 'slack' | 'gmail' | string;
  metadata?: { timestamps?: string[]; participants?: string[] };
  created_at: string;
}

// analysis.model.ts
export type AnalysisStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Analysis {
  id: string;
  conversation_id: string;
  status: AnalysisStatus;
  results?: {
    sentiment?: { scores: SentimentScore[]; aggregate?: string };
    clarity?: { readability?: number; flags?: string[] };
    behavioral?: { message_length_avg?: number; [key: string]: unknown };
  };
  created_at: string;
  completed_at?: string;
}

// api-response.model.ts
export interface PaginatedResponse<T> {
  data: T[];
  next_cursor?: string;
}
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
```

### 5.5 Error Handling

- **Global:** `ErrorInterceptor` maps status codes to user-facing messages; optionally push to a notification service or snackbar.
- **Per-call:** Services return `Observable<T>`; components handle error in `subscribe` or use `catchError` to map to a default or retry. No raw conversation content or PII in error logs.

---

## 6. Chart Visualization Setup

### 6.1 Library Choice

**Recommended:** **ng2-charts** (Chart.js wrapper for Angular) or **Angular wrapper for a chart library** (e.g. **ngx-charts** for D3-based charts, or **Apache ECharts** via `ngx-echarts`). For time-series and sentiment:

- **Sentiment over time:** Line or bar chart (e.g. score per message or per segment).
- **Dashboard analytics:** Line (trends), bar (comparisons), and optionally pie/donut for sentiment distribution.

**Suggestion:** **ng2-charts** (Chart.js) for MVP: simple API, good for line/bar; add **ngx-charts** or **echarts** later if you need richer interactivity or accessibility.

### 6.2 Structure

- **Shared chart components** in `shared/components/charts/` (e.g. `SentimentLineChartComponent`, `BarChartWrapperComponent`) that accept `@Input() data` and `@Input() options`.
- **Feature-specific charts** in feature folder (e.g. `analysis/components/sentiment-chart/`) when the chart is only used in one feature and has feature-specific logic.
- **Data shape:** Keep chart components presentational; parent fetches data and passes arrays (e.g. `{ label: string; value: number }[]` or time-series `{ timestamp: string; positive: number; negative: number }[]`).

### 6.3 Accessibility and Performance

- **Labels and legends:** Ensure chart title and axes are announced; use `role="img"` and `aria-label` where the library allows.
- **Lazy load:** Load chart module (or chart library) lazily in the analysis and dashboard routes to keep initial bundle smaller.
- **Large datasets:** For long conversations, aggregate (e.g. by segment or time bucket) before passing to chart; avoid rendering thousands of points.

---

## 7. Scalability Considerations

### 7.1 Code Organization

- **Lazy-loaded feature modules:** `conversations`, `analysis`, `dashboard` (and future `privacy`, `settings`) as lazy routes so initial load only includes shell + first route.
- **Barrel exports:** Use `index.ts` per feature and in `shared/` to keep imports clean (`import { X } from '@app/features/conversations'`).
- **Path aliases:** Configure `@app`, `@app/core`, `@app/shared`, `@app/features` in `tsconfig` so refactors don’t break imports.

### 7.2 Performance

- **OnPush change detection** for presentational and list components where possible.
- **TrackBy** on `*ngFor` for conversation and analysis lists.
- **Virtual scrolling** (e.g. `cdk-virtual-scroll-viewport`) for long lists (conversations, analyses).
- **Debounce** on upload form or search inputs before calling API.

### 7.3 Security and Privacy

- **No PII in URLs:** Use conversation and analysis IDs only; no titles or content in query params.
- **Sensitive data in memory only:** Pasted/uploaded text stays in component state until submit; do not persist raw content in `localStorage` or sessionStorage.
- **Consent and privacy UI:** Keep privacy dashboard and consent flows first-class; links from layout or settings.

### 7.4 Testing

- **Unit:** Services (with mocked HttpClient); components (with mocked services and inputs).
- **Integration:** API layer with mock server or test backend.
- **E2E:** Critical flows: login → upload conversation → trigger analysis → view sentiment insights → open dashboard (use test data only).

### 7.5 Future-Proofing

- **Standalone components and directives:** Prefer Angular’s standalone APIs for new components so the app can move to standalone-only when convenient.
- **Theming:** Use CSS variables (or Angular theming) for colors and spacing so dashboard and analysis views can support light/dark and future white-label.
- **i18n:** Structure templates and messages for translation (e.g. `i18n` attributes or a translation service) if multi-language is on the roadmap.

---

## 8. Summary

| Area | Choice |
|------|--------|
| **Structure** | Core / Shared / Features / Layout; feature modules per capability |
| **Services** | API services per resource; domain logic in feature services; auth in core |
| **State** | Signals + service state for MVP; NgRx if shared state grows |
| **API** | REST client + interceptors (base URL, auth, errors); typed models and DTOs |
| **Charts** | ng2-charts (Chart.js) or ngx-charts; lazy-loaded; presentational components |
| **Scalability** | Lazy loading, path aliases, OnPush, virtual scroll, no PII in URLs |

The app enables **uploading conversation text** (conversations feature), **viewing sentiment insights** (analysis feature with sentiment summary and chart), and **dashboard analytics** (dashboard feature with overview and trend charts), with a clear path to add privacy, settings, and more analyses.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 31, 2026 | Initial Angular frontend architecture |
| 1.1 | Jan 31, 2026 | Implementation: main-layout (header, sidebar with menu), dashboard-layout, analytics-overview, recent-analyses, trend-charts; DashboardService; routes: dashboard, conversations, conversations/upload, conversations/:id, analysis/:id |
| 1.2 | Jan 31, 2026 | Conversations: ConversationService, list/detail/upload pages; Analysis: AnalysisService, analysis-status, sentiment-summary, clarity-metrics, sentiment-trend-visualization, analysis-detail (polling, behavioral, chart description, empty state). Sentiment chart details; conversation detail (full ID, action description, nav); conversation upload (max 50k, submitting state, hint). Docs aligned. |
| 1.3 | Jan 31, 2026 | Conversations: **conversation-meta**, **conversation-analysis-action** (detail page); **upload-instructions**, **upload-hint** (upload page). Detail and upload pages refactored to use these components; COMPONENTS.md and FRONTEND_ARCHITECTURE updated. |
