import { beforeAll } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../server.js';
import { describeDb, tokenFor } from './helpers/db.js';
import User from '../src/models/User.js';
import ChatHistory from '../src/models/ChatHistory.js';
import Experience from '../src/models/Experience.js';
import ExperienceImage from '../src/models/ExperienceImage.js';

describeDb('DELETE /api/auth/account', () => {
  let user;
  let other;
  let imageId;
  beforeAll(async () => {
    const hash = await bcrypt.hash('Secreta123!', 10);
    user = await User.create({ email: `del_${Date.now()}@adastra.test`, password: hash, first_name: 'Del', last_name: 'Me' });
    other = await User.create({ email: `keep_${Date.now()}@adastra.test`, password: hash, first_name: 'Keep', last_name: 'Me' });
    const exp = await Experience.create({ user_id: user.id, zone_id: 'teide', title: 'x', images: [] });
    const img = await ExperienceImage.create({ experience_id: exp.id, mime_type: 'image/webp', size_bytes: 3, data: Buffer.from('abc') });
    imageId = img.id;
    await exp.update({ images: [`/media/${img.id}`] });
    for (const u of [user, other]) {
      await ChatHistory.create({ user_id: u.id, session_id: '11111111-1111-4111-8111-111111111111', message: 'hola', response: 'hola', language: 'es' });
    }
  });

  it('exige la contraseña correcta', async () => {
    expect((await request(app).delete('/api/auth/account').set('Authorization', `Bearer ${tokenFor(user)}`).send({})).status).toBe(400);
    expect((await request(app).delete('/api/auth/account').set('Authorization', `Bearer ${tokenFor(user)}`).send({ password: 'mala' })).status).toBe(401);
    expect(await User.findByPk(user.id)).not.toBeNull();
  });

  it('borra la cuenta y todos sus datos sin tocar los de otros usuarios', async () => {
    const res = await request(app).delete('/api/auth/account').set('Authorization', `Bearer ${tokenFor(user)}`).send({ password: 'Secreta123!' });
    expect(res.status).toBe(200);
    expect(await User.findByPk(user.id)).toBeNull();
    expect(await ChatHistory.count({ where: { user_id: user.id } })).toBe(0);
    expect(await Experience.count({ where: { user_id: user.id } })).toBe(0);
    expect(await ExperienceImage.findByPk(imageId)).toBeNull();
    expect(await ChatHistory.count({ where: { user_id: other.id } })).toBe(1);
  });
});

describeDb('PUT /api/auth/profile', () => {
  it('permite guardar con biografía y ubicación vacías', async () => {
    const hash = await bcrypt.hash('Secreta123!', 10);
    const u = await User.create({ email: `prof_${Date.now()}@adastra.test`, password: hash, first_name: 'A', last_name: 'B', bio: 'antes' });
    const res = await request(app).put('/api/auth/profile').set('Authorization', `Bearer ${tokenFor(u)}`)
      .send({ first_name: 'Ana', last_name: 'B', email: u.email, bio: '', location: '' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.first_name).toBe('Ana');
    expect(res.body.data.user.bio).toBe('');
  });
});

describeDb('DELETE /api/admin/users/:id/hard', () => {
  it('borra el usuario con sus conversaciones (antes fallaba por la clave foránea)', async () => {
    const hash = await bcrypt.hash('Secreta123!', 10);
    const admin = await User.create({ email: `adm_${Date.now()}@adastra.test`, password: hash, first_name: 'Ad', last_name: 'Min', role: 'admin' });
    const victim = await User.create({ email: `vic_${Date.now()}@adastra.test`, password: hash, first_name: 'Vi', last_name: 'Ctim' });
    await ChatHistory.create({ user_id: victim.id, session_id: '22222222-2222-4222-8222-222222222222', message: 'hola', response: 'hola', language: 'es' });
    const res = await request(app).delete(`/api/admin/users/${victim.id}/hard`).set('Authorization', `Bearer ${tokenFor(admin)}`);
    expect(res.status).toBe(200);
    expect(await User.findByPk(victim.id)).toBeNull();
    expect(await ChatHistory.count({ where: { user_id: victim.id } })).toBe(0);
    const self = await request(app).delete(`/api/admin/users/${admin.id}/hard`).set('Authorization', `Bearer ${tokenFor(admin)}`);
    expect(self.status).toBe(400);
  });
});
