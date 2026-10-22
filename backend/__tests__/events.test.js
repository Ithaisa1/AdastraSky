import { jest, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { generateEventsForYear, generateEventsForMonth } from '../src/utils/astronomyEvents.js';

describe('Events Endpoints', () => {
  describe('GET /api/events', () => {
    it('lista eventos astronómicos', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(res.body.data.length);
    });

    it('filtra eventos por mes y año', async () => {
      const res = await request(app).get('/api/events').query({ month: '8', year: '2026' });
      expect(res.status).toBe(200);
      expect(res.body.data.some((e) => e.id.startsWith('perseids_2026'))).toBe(true);
    });

    it('filtra eventos por tipo', async () => {
      const res = await request(app).get('/api/events').query({ type: 'meteor_shower', year: '2026' });
      expect(res.status).toBe(200);
      expect(res.body.data.every((e) => e.type === 'meteor_shower')).toBe(true);
    });

    it('devuelve nombres en el idioma pedido', async () => {
      const res = await request(app).get('/api/events').query({ month: '10', year: '2026', lang: 'de' });
      expect(res.body.data.map((e) => e.name)).toContain('Saturn in Opposition');
    });

    it('rechaza meses inválidos', async () => {
      const res = await request(app).get('/api/events').query({ month: '13' });
      expect(res.status).toBe(400);
    });
  });

  describe('Cálculo de eventos (Astronomy Engine)', () => {
    const y2026 = generateEventsForYear(2026, 'es');
    const byId = (prefix) => y2026.find((e) => e.id.startsWith(prefix));

    it('oposiciones con fechas reales (periodo sinódico, no orbital)', () => {
      expect(byId('saturn_opposition').date).toBe('2026-10-04');
      expect(byId('jupiter_opposition').date).toBe('2026-01-10');
      expect(generateEventsForYear(2027).find((e) => e.id.startsWith('mars_opposition')).date).toBe('2027-02-19');
    });

    it('eclipses de 2026 reales y su visibilidad desde Canarias', () => {
      const ecl = y2026.filter((e) => e.type === 'eclipse').map((e) => [e.date, e.kind, e.visible_from_canarias]);
      expect(ecl).toEqual([
        ['2026-03-03', 'lunar', false],
        ['2026-08-12', 'solar', true],
        ['2026-08-28', 'lunar', true],
      ]);
    });

    it('lluvias de meteoros en su fecha de máximo', () => {
      expect(['2026-08-12', '2026-08-13']).toContain(byId('perseids').date);
      expect(['2026-12-13', '2026-12-14']).toContain(byId('geminids').date);
      expect(['2026-01-03', '2026-01-04']).toContain(byId('quadrantids').date);
    });

    it('no incluye datos inventados (cometas sin efemérides)', () => {
      expect(y2026.some((e) => e.type === 'comet')).toBe(false);
    });

    it('mantiene los campos que usa el calendario', () => {
      for (const e of y2026) {
        expect(e).toEqual(expect.objectContaining({ id: expect.any(String), name: expect.any(String), type: expect.any(String), date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) }));
      }
    });

    it('filtra por mes', () => {
      expect(generateEventsForMonth(2026, 8).every((e) => e.date.startsWith('2026-08'))).toBe(true);
    });
  });

  describe('POST /api/events/seed', () => {
    it('eventos generados dinámicamente', async () => {
      const res = await request(app).post('/api/events/seed');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/events/nasa/apod', () => {
    afterEach(() => jest.restoreAllMocks());

    it('devuelve las imágenes de la NASA (API simulada)', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({ json: async () => [{ title: 'M31', url: 'https://apod.nasa.gov/x.jpg' }] });
      const res = await request(app).get('/api/events/nasa/apod');
      expect(res.status).toBe(200);
      expect(res.body.data[0].title).toBe('M31');
    });

    it('maneja errores de la API externa', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('timeout'));
      const res = await request(app).get('/api/events/nasa/apod');
      expect(res.status).toBe(500);
    });
  });
});
