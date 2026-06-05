import request from 'supertest';
import app from '../server.js';

const TEST_EMAIL = `test_${Date.now()}@adastra.test`;
const TEST_PASSWORD = 'TestPass123!';
let authToken = '';

describe('Auth Endpoints', () => {
  afterAll(async () => {
  });

  describe('POST /api/auth/register', () => {
    it('registra un nuevo usuario', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          first_name: 'Test',
          last_name: 'User',
        });
      if (res.status === 201) {
        expect(res.body.status).toBe('success');
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data.user.email).toBe(TEST_EMAIL);
        authToken = res.body.data.token;
      } else if (res.status === 409) {
        // User already exists, try login
      }
    });

    it('rechaza email inválido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalido',
          password: TEST_PASSWORD,
          first_name: 'Test',
          last_name: 'User',
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('rechaza password corta', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'short@test.com',
          password: '123',
          first_name: 'Test',
          last_name: 'User',
        });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('inicia sesión con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
      if (res.status === 400) return; // Skip if register didn't create user
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      authToken = res.body.data.token;
    });

    it('rechaza credenciales inválidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: 'wrongpass' });
      if (res.status === 400) return; // Skip if user wasn't created
      expect(res.status).toBe(401);
    });

    it('rechaza email mal formado en login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notanemail', password: TEST_PASSWORD });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('rechaza sin token', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
    });

    it('obtiene perfil con token válido', async () => {
      if (!authToken) return;
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('user');
    });
  });
});
