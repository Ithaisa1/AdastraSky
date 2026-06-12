import request from 'supertest';
import app from '../server.js';

describe('GET /health', () => {
  it('responde con estado del servidor', async () => {
    const res = await request(app).get('/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('database', 'connected');
      expect(res.body).toHaveProperty('timestamp');
    }
  });
});

describe('GET /api', () => {
  it('responde con info de la API', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'AdastraSky API');
    expect(res.body).toHaveProperty('version', '1.0.0');
    expect(res.body).toHaveProperty('environment');
  });
});
