/**
 * Almacén de imágenes de experiencias en PostgreSQL.
 * URL pública: /media/<uuid> (fuera de /api para no consumir el rate limit).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { validate as uuidValidate } from 'uuid';
import ExperienceImage from '../models/ExperienceImage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
export const MAX_IMAGE_SIDE = 1600;
export const MEDIA_PREFIX = '/media/';

/** Redimensiona a WebP (máx. 1600 px) y guarda en la BD. Devuelve la URL pública. */
export async function saveImage(buffer, experienceId = null) {
  const out = await sharp(buffer, { failOn: 'error' })
    .rotate()
    .resize({ width: MAX_IMAGE_SIDE, height: MAX_IMAGE_SIDE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });
  const img = await ExperienceImage.create({
    experience_id: experienceId,
    mime_type: 'image/webp',
    size_bytes: out.info.size,
    width: out.info.width,
    height: out.info.height,
    data: out.data
  });
  return `${MEDIA_PREFIX}${img.id}`;
}

export const mediaIdFromUrl = (url) => {
  if (typeof url !== 'string' || !url.startsWith(MEDIA_PREFIX)) return null;
  const id = url.slice(MEDIA_PREFIX.length);
  return uuidValidate(id) ? id : null;
};

/** Borra imágenes por URL: las nuevas (/media) de la BD y las antiguas (/uploads) del disco. */
export async function deleteImagesByUrls(urls = []) {
  const ids = urls.map(mediaIdFromUrl).filter(Boolean);
  if (ids.length) await ExperienceImage.destroy({ where: { id: ids } });
  for (const url of urls) {
    if (typeof url === 'string' && url.startsWith('/uploads/')) {
      const filePath = path.join(UPLOADS_DIR, path.basename(url));
      fs.unlink(filePath, () => {});
    }
  }
}

/** Handler Express: GET /media/:id */
export async function serveImage(req, res, next) {
  try {
    if (!uuidValidate(req.params.id)) return res.status(404).end();
    const img = await ExperienceImage.findByPk(req.params.id);
    if (!img) return res.status(404).end();
    res.set({
      'Content-Type': img.mime_type,
      'Content-Length': img.size_bytes,
      'Cache-Control': 'public, max-age=31536000, immutable'
    });
    res.send(img.data);
  } catch (error) {
    next(error);
  }
}
