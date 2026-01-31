# ReflectAI Performance Tests

Performance tests for API throughput and latency. Run against a local or test backend.

## Tools

- **k6** (recommended): `k6 run conversations.js`
- **Node script**: `node conversations-node.js` (no k6 required)

## Prerequisites

- Backend running at `BASE_URL` (default `http://localhost:3000`)
- Set `x-user-id` (and optionally `x-tenant-id`) for authenticated endpoints

## k6 (optional)

Install k6: https://k6.io/docs/getting-started/installation/

```bash
cd tests/performance
k6 run conversations.js
```

With config:

```bash
k6 run --env BASE_URL=http://localhost:3000 --duration 30s --vus 10 conversations.js
```

## Node script (no k6)

```bash
cd tests/performance
BASE_URL=http://localhost:3000 node conversations-node.js
```

Measures: requests per second, p50/p95/p99 latency, error rate. Output to stdout.

## Thresholds (from TESTING_STRATEGY)

| Scenario           | Metric   | Target (example) |
|--------------------|----------|------------------|
| GET /health        | p99      | < 100 ms         |
| POST /v1/conversations | p95  | < 500 ms         |
| POST /v1/analyses  | p95      | < 300 ms         |
| GET /v1/analyses/:id | p95    | < 200 ms         |

## Results

Output to stdout. Optionally save to `tests/performance/results/` (gitignored).
