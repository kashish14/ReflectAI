# ReflectAI Frontend

Angular 21 single-page app: dashboard, conversation list/detail, new conversation, and analysis detail.

- Standalone components, signals, `@if`/`@for` control flow
- Charts are plain CSS (no chart library)
- Unit tests run on Vitest via `@angular/build:unit-test`

## Commands

```bash
npm ci
npm start      # http://localhost:4200, proxies /api to http://localhost:3000
npm run build  # output in dist/reflectai-frontend
npm test
```

The backend must be running for data to load. `src/app/core/http/demo-auth.interceptor.ts` adds the `x-user-id: demo-user` header so the seeded demo data is returned.

## Structure

| Path | Purpose |
|------|---------|
| `src/app/core/` | HTTP interceptor |
| `src/app/layout/` | App shell: header, sidebar, main layout |
| `src/app/features/` | `dashboard`, `conversations`, `analysis` |
| `src/app/shared/` | Insight card, privacy notice |
| `src/app/models/` | API types |

More detail: [COMPONENTS.md](src/app/COMPONENTS.md) and [Frontend Architecture](../docs/FRONTEND_ARCHITECTURE.md).
