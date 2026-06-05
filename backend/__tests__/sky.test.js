import request from 'supertest';
import app from '../server.js';

describe('Sky Zones Endpoints', () => {
  describe('GET /api/sky/zones', () => {
    it('lista zonas astronómicas', async () => {
      const res = await request(app).get('/api/sky/zones');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('zones');
      expect(Array.isArray(res.body.data.zones)).toBe(true);
    });
  });

  describe('GET /api/sky/zones/geojson', () => {
    it('exporta GeoJSON', async () => {
      const res = await request(app).get('/api/sky/zones/geojson');
      expect(res.status).toBe(200);
      expect(res.body.type).toBe('FeatureCollection');
      expect(res.body).toHaveProperty('features');
    });
  });

  describe('GET /api/sky/zones/query', () => {
    it('filtra zonas por isla', async () => {
      const res = await request(app)
        .get('/api/sky/zones/query')
        .query({ island: 'Tenerife' });
      expect(res.status).toBe(200);
    });

    it('filtra zonas por categoría', async () => {
      const res = await request(app)
        .get('/api/sky/zones/query')
        .query({ category: 'observatory' });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/sky/score/latest', () => {
    it('obtiene último score', async () => {
      const res = await request(app).get('/api/sky/score/latest');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/sky/score', () => {
    it('rechaza sin autenticación', async () => {
      const res = await request(app)
        .post('/api/sky/score')
        .send({ date: '2026-06-05', overall_score: 8 });
      expect(res.status).toBe(401);
    });
  });
});
