import request from 'supertest';
import app from '../server.js';

describe('Middleware', () => {
  describe('404 handler', () => {
    it('responde 404 en ruta inexistente', async () => {
      const res = await request(app).get('/api/ruta-que-no-existe');
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    it('responde 404 en ruta anidada inexistente', async () => {
      const res = await request(app).get('/api/auth/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('Rate limiting', () => {
    it('rate limiter activo en /api/', async () => {
      const res = await request(app).get('/api');
      expect(res.status).toBe(200);
      expect(res.headers).toHaveProperty('ratelimit-limit');
    });
  });
});
