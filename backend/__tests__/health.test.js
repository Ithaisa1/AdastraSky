import request from 'supertest';
import app from '../server.js';

describe('GET /health', () => {
  it('responde con estado healthy o unhealthy', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('service', 'AdastraSky Backend');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('database');
  });
});

describe('GET /api', () => {
  it('responde con info de la API', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'AdastraSky API');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('endpoints');
    expect(res.body.endpoints).toHaveProperty('auth');
    expect(res.body.endpoints).toHaveProperty('sky');
    expect(res.body.endpoints).toHaveProperty('chat');
  });
});
