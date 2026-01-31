# ReflectAI Frontend (Angular + TypeScript)

Angular SPA for ReflectAI: upload conversations, view sentiment insights, and dashboard analytics.

## Stack

- **Angular** 18+
- **TypeScript** 5.x
- **Charts:** ng2-charts (Chart.js) or ngx-charts
- **State:** Angular Signals + service-based state (NgRx optional)

## Structure

| Path | Purpose |
|------|---------|
| `src/app/core/` | Singletons: auth, HTTP interceptors |
| `src/app/shared/` | Reusable components, pipes, directives |
| `src/app/features/` | Feature modules: conversations, analysis, dashboard |
| `src/app/layout/` | App shell: main layout, header, sidebar |
| `src/app/models/` | TypeScript interfaces (Conversation, Analysis, API) |

## Key Features

- **Upload conversation text** — `features/conversations` (upload, list, detail)
- **View sentiment insights** — `features/analysis` (status, sentiment summary, chart, clarity)
- **Dashboard analytics** — `features/dashboard` (overview, trend charts, recent analyses)

## Docs

Full architecture (components, services, state, API layer, charts, scalability): **[Frontend Application Architecture](../docs/FRONTEND_ARCHITECTURE.md)**.

## Setup (after Angular is initialized)

```bash
npm install
ng serve
```

Configure `src/environments/environment.ts` with `apiUrl` (e.g. `https://api.reflectai.com/v1` or `/api/v1`).
