import request from 'supertest';
import app from '../server.js';

describe('Events Endpoints', () => {
  describe('GET /api/events', () => {
    it('lista eventos astronómicos', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
    });

    it('filtra eventos por mes y año', async () => {
      const res = await request(app)
        .get('/api/events')
        .query({ month: '8', year: '2026' });
      expect(res.status).toBe(200);
    });

    it('filtra eventos por tipo', async () => {
      const res = await request(app)
        .get('/api/events')
        .query({ type: 'meteor_shower' });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/events/seed', () => {
    it('eventos generados dinámicamente', async () => {
      const res = await request(app).post('/api/events/seed');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/events/nasa/apod', () => {
    it('obtiene APOD de NASA o maneja error externo', async () => {
      const res = await request(app).get('/api/events/nasa/apod');
      expect([200, 500, 503]).toContain(res.status);
    });
  });
});
