/**
 * Integration tests: conversation API (POST, GET list, GET by id).
 * Uses real app with in-memory repositories; no external services.
 */

import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();
const userId = 'test-user-1';
const tenantId = 'test-tenant-1';

describe('Conversations API (integration)', () => {
  it('POST /v1/conversations returns 201 with conversation id', async () => {
    const res = await request(app)
      .post('/v1/conversations')
      .set('x-user-id', userId)
      .set('x-tenant-id', tenantId)
      .send({ content: 'Test message one.\nTest message two.' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('created_at');
    expect(res.body.user_id).toBe(userId);
    expect(res.body.tenant_id).toBe(tenantId);
    expect(res.body.source).toBe('manual');
    expect(res.body).not.toHaveProperty('content');
  });

  it('GET /v1/conversations returns list with cursor', async () => {
    const res = await request(app)
      .get('/v1/conversations')
      .set('x-user-id', userId)
      .set('x-tenant-id', tenantId)
      .query({ limit: 10 })
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      expect(res.body.data[0]).toHaveProperty('id');
      expect(res.body.data[0]).not.toHaveProperty('content');
    }
  });

  it('GET /v1/conversations/:id returns 200 for existing conversation', async () => {
    const createRes = await request(app)
      .post('/v1/conversations')
      .set('x-user-id', userId)
      .set('x-tenant-id', tenantId)
      .send({ content: 'Fixture for get by id.' })
      .expect(201);

    const id = createRes.body.id;
    const getRes = await request(app)
      .get(`/v1/conversations/${id}`)
      .set('x-user-id', userId)
      .set('x-tenant-id', tenantId)
      .expect(200);

    expect(getRes.body.id).toBe(id);
    expect(getRes.body).not.toHaveProperty('content');
  });

  it('POST /v1/conversations without x-user-id returns 401', async () => {
    await request(app)
      .post('/v1/conversations')
      .send({ content: 'hello' })
      .expect(401);
  });

  it('POST /v1/conversations with invalid body returns 400', async () => {
    await request(app)
      .post('/v1/conversations')
      .set('x-user-id', userId)
      .send({ content: '' })
      .expect(400);
  });
});
