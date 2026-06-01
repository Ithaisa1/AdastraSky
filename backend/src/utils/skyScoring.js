const WEIGHTS = {
  ASTRO: { bortle: 0.35, seeing: 0.20, transparency: 0.15, altitude: 0.10, cloudiness: 0.10, humidity: 0.10 },
  PHOTO: { landscape: 0.25, orientation: 0.20, composition: 0.20, accessibility: 0.15, bortle: 0.20 },
  TOURISM: { access: 0.30, safety: 0.25, services: 0.25, parking: 0.20 },
};

const invertBortle = (b) => Math.max(0, 10 - (b || 5));
const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

const toNum = (v, fallback = 5) => {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
};

export const calcAstroScore = (zone) => {
  const b = invertBortle(toNum(zone.bortle_scale, 5)) * 10;
  const seeing = toNum(zone.seeing_estimate, 2);
  const s = clamp(seeing <= 1.5 ? 90 : seeing <= 2.5 ? 70 : 40, 0, 100);
  const t = clamp(toNum(zone.transparency, 80) * 1.25, 0, 100);
  const a = clamp(toNum(zone.altitude, 500) / 40, 0, 100);
  const c = clamp(100 - toNum(zone.avg_cloudiness, 30) * 1.5, 0, 100);
  const h = clamp(100 - toNum(zone.avg_humidity, 50), 0, 100);
  const W = WEIGHTS.ASTRO;
  return clamp(Math.round(b * W.bortle + s * W.seeing + t * W.transparency + a * W.altitude + c * W.cloudiness + h * W.humidity));
};

export const calcPhotoScore = (zone) => {
  const l = clamp(toNum(zone.landscape_quality, 3) / 3 * 100, 0, 100);
  const o = clamp(toNum(zone.astro_orientation, 3) / 3 * 100, 0, 100);
  const comp = clamp(toNum(zone.photo_composition, 3) / 3 * 100, 0, 100);
  const acc = clamp(toNum(zone.photographer_access, 3) / 3 * 100, 0, 100);
  const b = invertBortle(toNum(zone.bortle_scale, 5)) * 10;
  const W = WEIGHTS.PHOTO;
  return clamp(Math.round(l * W.landscape + o * W.orientation + comp * W.composition + acc * W.accessibility + b * W.bortle));
};

export const calcTourismScore = (zone) => {
  const accessMap = { car: 100, '4x4': 60, trail: 40, hike: 20, restricted: 5 };
  const ac = accessMap[zone.access_type] || 40;
  const sf = clamp(100 - toNum(zone.safety_risk, 1) * 25, 0, 100);
  const sv = (zone.has_parking ? 25 : 0) + (zone.has_bathrooms ? 25 : 0) + (zone.has_cafe ? 25 : 0) + (zone.has_mobile_coverage ? 25 : 0);
  const pk = zone.has_parking ? 80 : 20;
  const W = WEIGHTS.TOURISM;
  return clamp(Math.round(ac * W.access + sf * W.safety + sv * W.services + pk * W.parking));
};

export const calcGlobalScore = (zone) => {
  const astro = calcAstroScore(zone);
  const photo = calcPhotoScore(zone);
  const tourism = calcTourismScore(zone);
  return { astro, photo, tourism, global: Math.round(astro * 0.5 + photo * 0.3 + tourism * 0.2) };
};

export const calcBortleDarkness = (bortle) => Math.max(1, Math.min(10, 11 - (bortle || 5)));

export const getScoreLabel = (score) => {
  if (score >= 85) return { label: 'Excelente', color: 'text-green-400', bar: 'bg-green-500' };
  if (score >= 70) return { label: 'Muy Bueno', color: 'text-emerald-400', bar: 'bg-emerald-500' };
  if (score >= 50) return { label: 'Bueno', color: 'text-amber-400', bar: 'bg-amber-500' };
  if (score >= 30) return { label: 'Aceptable', color: 'text-orange-400', bar: 'bg-orange-500' };
  return { label: 'Bajo', color: 'text-red-400', bar: 'bg-red-500' };
};

export const findBestZone = (zones, criteria = {}) => {
  const scored = zones.map(z => ({ ...z.dataValues || z, scores: calcGlobalScore(z) }));
  let filtered = [...scored];

  if (criteria.island) filtered = filtered.filter(z => z.island === criteria.island);
  if (criteria.category) filtered = filtered.filter(z => z.category === criteria.category);
  if (criteria.maxBortle) filtered = filtered.filter(z => Number(z.bortle_scale) <= criteria.maxBortle);
  if (criteria.minAltitude) filtered = filtered.filter(z => Number(z.altitude) >= criteria.minAltitude);
  if (criteria.accessType) filtered = filtered.filter(z => z.access_type === criteria.accessType);
  if (criteria.minAstroScore) filtered = filtered.filter(z => z.scores.astro >= criteria.minAstroScore);

  if (criteria.priority === 'photo') filtered.sort((a, b) => b.scores.photo - a.scores.photo);
  else if (criteria.priority === 'tourism') filtered.sort((a, b) => b.scores.tourism - a.scores.tourism);
  else filtered.sort((a, b) => b.scores.global - a.scores.global);

  return filtered;
};
