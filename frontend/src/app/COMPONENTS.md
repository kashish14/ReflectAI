# ReflectAI — Frontend Components

**Last Updated:** January 31, 2026

Modular Angular components for ReflectAI. All components are **standalone** and use shared design tokens from `src/styles.scss`.

---

## 1. Layout (App Shell)

| Component | Location | Purpose |
|-----------|----------|---------|
| **Main layout** | `layout/main-layout/` | Grid shell: header, sidebar, main content outlet. Responsive (sidebar below on small screens). |
| **Header** | `layout/header/` | Brand “ReflectAI” and tagline. |
| **Sidebar** | `layout/sidebar/` | Main nav: Dashboard, Conversations, New conversation. Uses `RouterLink` and `routerLinkActive`. |

---

## 2. Conversations Feature

| Component | Location | Purpose |
|-----------|----------|---------|
| **Conversation input** | `features/conversations/components/conversation-input/` | Textarea (max 50,000 chars), character count, hint, Clear / Analyze buttons. Input `submitting` disables submit and shows “Uploading…”. Emits `submitted` and `cancelled`. |
| **Conversation list** | `features/conversations/components/conversation-list/` | Loads list via `ConversationService.list()`. Shows cards: id prefix, created date, source; link to `/conversations/:id`. Empty and loading states. |
| **Conversation meta** | `features/conversations/components/conversation-meta/` | Presentational: shows conversation **Details** (ID in `<code>`, Created date, Source). Inputs: `id`, `createdAt`, `source`. Used in conversation-detail-page. |
| **Conversation analysis action** | `features/conversations/components/conversation-analysis-action/` | **Analysis** section: description text + “Analyze conversation” button. Inputs: `analyzing`, `errorMessage`, optional `description`. Output: `startAnalysis`. Used in conversation-detail-page. |
| **Conversation detail page** | `features/conversations/components/conversation-detail-page/` | Composes: title, subtitle, **app-conversation-meta** (id, created, source), **app-conversation-analysis-action** (analyzing, error, startAnalysis). Card wrapper; nav: Back to list, Dashboard. |
| **Upload instructions** | `features/conversations/components/upload-instructions/` | **How it works** section: subtitle text + optional bullet tips (max 50k chars, one message per line, create + analyze + redirect). Inputs: `subtitle`, `showTips`. Used in conversation-upload-page. |
| **Upload hint** | `features/conversations/components/upload-hint/` | Hint paragraph with link. Inputs: `text`, `linkText`, `linkRoute`, `textAfter`. Used in conversation-upload-page below the form. |
| **Conversation upload page** | `features/conversations/components/conversation-upload-page/` | Composes: title, **app-upload-instructions**, error (if any), form section (“Paste your text”) with **app-conversation-input**, **app-upload-hint**. On submit: create conversation → create analysis → navigate to analysis (or show error). |

**Services:** `ConversationService` — `create(content)`, `list(options?)`, `getById(id)` → `/api/v1/conversations`.

---

## 3. Analysis Feature

| Component | Location | Purpose |
|-----------|----------|---------|
| **Analysis status** | `features/analysis/components/analysis-status/` | Badge for status: pending, running, completed, failed. Optional `message` input. |
| **Sentiment summary** | `features/analysis/components/sentiment-summary/` | From `analysis.results.sentiment`: aggregate text, emotional labels (tags), message count. |
| **Clarity metrics** | `features/analysis/components/clarity-metrics/` | From `analysis.results.clarity`: readability score (e.g. /10), flags list. |
| **Sentiment trend visualization** | `features/analysis/components/sentiment-trend-visualization/` | Stacked bar chart. Input: `data: SentimentTrendPoint[]`, `title`, `showLabels`, `barHeight`. Each bar: green (positive), gray (neutral), red (negative). Legend below. |
| **Analysis detail page** | `features/analysis/components/analysis-detail-page/` | Loads analysis by id; polls every 2s until completed/failed. Shows: ID (prefix + title with full id), status badge, created/completed dates. When completed: sentiment summary, clarity metrics, behavioral (avg message length if present), **sentiment chart** (by message) with description (“Each bar is one message. Green = positive, gray = neutral, red = negative.”) and empty state if no scores. Nav: Dashboard, Conversations. |

**Services:** `AnalysisService` — `create(request)`, `getById(id)` → `/api/v1/analyses`.

---

## 4. Dashboard Feature

| Component | Location | Purpose |
|-----------|----------|---------|
| **Dashboard layout** | `features/dashboard/components/dashboard-layout/` | Wraps dashboard pages: page title, subtitle, optional privacy slot, content projection. |
| **Analytics overview** | `features/dashboard/components/analytics-overview/` | Three insight cards from `DashboardService.getOverview()`: Analyses total, Completed count, Completion rate %. |
| **Recent analyses** | `features/dashboard/components/recent-analyses/` | List of recent analyses: id prefix, date, status; link to `/analysis/:id`. |
| **Trend charts** | `features/dashboard/components/trend-charts/` | Wraps sentiment-trend-visualization; data from overview `trend_buckets` or fallback sample. |
| **Dashboard** | `features/dashboard/components/dashboard/` | Composes: dashboard-layout, privacy notice (when not dismissed), analytics-overview, trend-charts, recent-analyses. Loads overview on init. |

**Services:** `DashboardService` — `getOverview()` → `/api/v1/insights/overview`.

---

## 5. Shared

| Component | Location | Purpose |
|-----------|----------|---------|
| **Insight card** | `shared/components/insight-card/` | Card: title, value, optional trend (up/down/neutral), trendLabel, icon, variant (default | positive | neutral | negative), optional link. |
| **Privacy notice** | `shared/components/privacy-notice/` | Banner or modal; dismissible; emits `dismissed`. |

---

## 6. Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | redirect | → `/dashboard` |
| `/dashboard` | DashboardComponent | Overview, trend chart, recent analyses. |
| `/conversations` | ConversationListComponent | List of conversations. |
| `/conversations/upload` | ConversationUploadPageComponent | New conversation + auto analysis → redirect to analysis. |
| `/conversations/:id` | ConversationDetailPageComponent | Conversation detail + “Analyze” → analysis. |
| `/analysis/:id` | AnalysisDetailPageComponent | Analysis detail; polling; sentiment, clarity, behavioral, chart. |

---

## 7. Design & Accessibility

- **Tokens:** Spacing, radius, shadows, colors in `:root` and `[data-theme='dark']` in `src/styles.scss`.
- **Scoped styles:** Each component uses its own `.scss`; no global component classes beyond tokens.
- **Accessibility:** Labels, `aria-*`, `role`, nav `aria-label`; keyboard-friendly buttons and links.

---

## 8. Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 31, 2026 | Initial component list. |
| 1.1 | Jan 31, 2026 | Layout, conversations (list, detail, upload), analysis (status, summary, clarity, chart, detail), dashboard (layout, overview, recent, trend); routes; sentiment chart and upload/detail details. |
| 1.2 | Jan 31, 2026 | Conversations: **conversation-meta**, **conversation-analysis-action** (used in detail page); **upload-instructions**, **upload-hint** (used in upload page). Detail and upload pages refactored to use these components; docs updated. |
