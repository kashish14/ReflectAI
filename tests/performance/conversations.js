/**
 * k6 script: POST /v1/conversations and GET /v1/conversations.
 * Run: k6 run --env BASE_URL=http://localhost:3000 conversations.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const USER_ID = __ENV.USER_ID || 'perf-user';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const payload = JSON.stringify({
    content: 'Performance test message.\nLine two.\nLine three.',
  });
  const params = {
    headers: { 'Content-Type': 'application/json', 'x-user-id': USER_ID },
  };
  const createRes = http.post(`${BASE_URL}/v1/conversations`, payload, params);
  check(createRes, { 'create status 201': (r) => r.status === 201 });
  if (createRes.status !== 201) return;
  const body = createRes.json();
  const id = body.id;
  if (!id) return;
  const getRes = http.get(`${BASE_URL}/v1/conversations/${id}`, {
    headers: { 'x-user-id': USER_ID },
  });
  check(getRes, { 'get status 200': (r) => r.status === 200 });
  sleep(0.1);
}
