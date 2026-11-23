import request from 'supertest';
import { createApp } from '../../src/app';

describe('/v1/users/me', () => {
  const app = createApp();
  const user = { 'x-user-id': 'privacy-user', 'x-tenant-id': 'privacy-tenant' };

  it('exports, then deletes, the user data', async () => {
    await request(app).post('/v1/conversations').set(user).send({ content: 'Thanks for the help!' }).expect(201);

    const exported = await request(app).post('/v1/users/me/export').set(user).expect(200);
    expect(exported.body.conversations).toHaveLength(1);

    const deleted = await request(app).delete('/v1/users/me/data').set(user).expect(200);
    expect(deleted.body.deleted.conversations).toBe(1);

    const after = await request(app).get('/v1/conversations').set(user).expect(200);
    expect(after.body.data).toHaveLength(0);
  });
});
