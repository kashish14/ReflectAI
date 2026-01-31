# ReflectAI Tests

Central place for cross-cutting tests, fixtures, and performance scripts.

## Structure

| Path | Purpose |
|------|---------|
| `fixtures/` | Shared test data: conversation payloads, AI golden inputs |
| `fixtures/ai/` | Synthetic text for analytics-engine golden/validation tests |
| `performance/` | Performance test scripts (k6 + Node fallback) and config |

## Unit and Integration Tests

- **Backend:** `backend/` — `npm test` (Jest). Unit: `src/**/*.test.ts`; integration: `tests/integration/*.integration.test.ts`.
- **Analytics-engine:** `analytics-engine/` — `npm test` (Jest). Unit: `src/**/*.test.ts`; AI validation: `__tests__/ai-validation.test.ts`.
- **Frontend:** `frontend/` — `ng test` (Jasmine/Karma or Jest per Angular setup).

## Performance Tests

See `performance/README.md`. Run backend locally, then:

```bash
cd tests/performance
BASE_URL=http://localhost:3000 node conversations-node.js
```

Or with k6: `k6 run conversations.js`.

## Testing Strategy

Full strategy (unit, integration, AI validation, performance): [docs/TESTING_STRATEGY.md](../docs/TESTING_STRATEGY.md)
