#!/usr/bin/env node
/**
 * Simple performance script: POST /v1/conversations and GET /v1/conversations.
 * No k6 required. Usage: BASE_URL=http://localhost:3000 node conversations-node.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DURATION_MS = parseInt(process.env.DURATION_MS || '10000', 10);
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '5', 10);
const USER_ID = process.env.USER_ID || 'perf-user';

const payload = { content: 'Performance test message.\nLine two.\nLine three.' };

function request(method, path, body = null) {
  const url = BASE_URL + path;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', 'x-user-id': USER_ID },
  };
  if (body) options.body = JSON.stringify(body);
  return fetch(url, options);
}

async function runOne() {
  const start = Date.now();
  const createRes = await request('POST', '/v1/conversations', payload);
  const createLatency = Date.now() - start;
  if (!createRes.ok) {
    return { ok: false, latency: createLatency, status: createRes.status };
  }
  const data = await createRes.json();
  const id = data.id;
  const getStart = Date.now();
  await request('GET', `/v1/conversations/${id}`);
  const getLatency = Date.now() - getStart;
  return { ok: true, createLatency, getLatency };
}

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const i = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, i)];
}

async function main() {
  const latencies = [];
  const errors = { count: 0 };
  const endAt = Date.now() + DURATION_MS;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (Date.now() < endAt) {
      const r = await runOne();
      if (r.ok) {
        latencies.push(r.createLatency);
        latencies.push(r.getLatency);
      } else {
        errors.count++;
      }
    }
  });
  await Promise.all(workers);

  const total = latencies.length + errors.count;
  const rate = total / (DURATION_MS / 1000);
  const p50 = percentile(latencies, 50);
  const p95 = percentile(latencies, 95);
  const p99 = percentile(latencies, 99);

  console.log('--- ReflectAI performance (conversations) ---');
  console.log('Base URL:', BASE_URL);
  console.log('Duration (ms):', DURATION_MS);
  console.log('Concurrency:', CONCURRENCY);
  console.log('Total requests:', total);
  console.log('Errors:', errors.count);
  console.log('Rate (req/s):', rate.toFixed(2));
  console.log('Latency p50 (ms):', p50);
  console.log('Latency p95 (ms):', p95);
  console.log('Latency p99 (ms):', p99);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
