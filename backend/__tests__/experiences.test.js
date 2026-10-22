import request from 'supertest';
import { beforeAll } from "@jest/globals";
import sharp from 'sharp';
import app from '../server.js';
import { describeDb, tokenFor, createUser } from './helpers/db.js';
import User from '../src/models/User.js';
import ExperienceImage from '../src/models/ExperienceImage.js';

describeDb('Experiencias con imágenes en PostgreSQL', () => {
  let user;
  let png;
  beforeAll(async () => {
    user = await createUser(User, `photo_${Date.now()}`);
    png = await sharp({ create: { width: 3000, height: 2000, channels: 3, background: { r: 10, g: 20, b: 60 } } }).png().toBuffer();
  });

  it('guarda la imagen redimensionada en la BD, la sirve y la borra con la experiencia', async () => {
    const created = await request(app).post('/api/experiences')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .field('title', 'Noche en el Teide').field('zone_id', 'teide')
      .attach('images', png, { filename: 'cielo.png', contentType: 'image/png' });
    expect(created.status).toBe(201);
    const [url] = created.body.data.images;
    expect(url).toMatch(/^\/media\/[0-9a-f-]{36}$/);

    const img = await request(app).get(url);
    expect(img.status).toBe(200);
    expect(img.headers['content-type']).toBe('image/webp');
    const meta = await sharp(img.body).metadata();
    expect(Math.max(meta.width, meta.height)).toBe(1600);

    const row = await ExperienceImage.findByPk(url.split('/').pop());
    expect(row.experience_id).toBe(created.body.data.id);

    const del = await request(app).delete(`/api/experiences/${created.body.data.id}`).set('Authorization', `Bearer ${tokenFor(user)}`);
    expect(del.status).toBe(200);
    expect((await request(app).get(url)).status).toBe(404);
  });

  it('rechaza ficheros que no son imágenes válidas', async () => {
    const res = await request(app).post('/api/experiences')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .field('title', 'x').field('zone_id', 'teide')
      .attach('images', Buffer.from('no soy una imagen'), { filename: 'falsa.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_IMAGE');
  });
});

describe('GET /media/:id', () => {
  it('404 con id inválido', async () => {
    expect((await request(app).get('/media/../../etc/passwd')).status).toBe(404);
    expect((await request(app).get('/media/no-uuid')).status).toBe(404);
  });
});
