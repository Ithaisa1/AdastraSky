import PDFDocument from 'pdfkit';
import SkyQualityZone from '../models/SkyQualityZone.js';
import { Op } from 'sequelize';
import { calcGlobalScore, findBestZone } from '../utils/skyScoring.js';

const withScores = (zone) => {
  const plain = zone.dataValues || zone;
  const scores = calcGlobalScore(plain);
  return { ...plain, astro_score: scores.astro, photo_score: scores.photo, tourism_score: scores.tourism, global_score: scores.global, scores };
};

export const getAllZones = async (req, res, next) => {
  try {
    const zones = await SkyQualityZone.findAll({
      where: { is_active: true },
      order: [['island', 'ASC'], ['name', 'ASC']]
    });
    const data = zones.map(withScores);
    res.status(200).json({ status: 'success', count: data.length, data: { zones: data } });
  } catch (error) { next(error); }
};

export const getZoneById = async (req, res, next) => {
  try {
    const zone = await SkyQualityZone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ status: 'error', code: 'ZONE_NOT_FOUND', message: 'Zona no encontrada' });
    res.status(200).json({ status: 'success', data: { zone: withScores(zone) } });
  } catch (error) { next(error); }
};

export const getZonesByIsland = async (req, res, next) => {
  try {
    const zones = await SkyQualityZone.findAll({ where: { island: req.params.island, is_active: true }, order: [['category', 'ASC'], ['name', 'ASC']] });
    res.status(200).json({ status: 'success', count: zones.length, data: { zones: zones.map(withScores) } });
  } catch (error) { next(error); }
};

export const getZonesByCategory = async (req, res, next) => {
  try {
    const zones = await SkyQualityZone.findAll({ where: { category: req.params.category, is_active: true }, order: [['island', 'ASC'], ['name', 'ASC']] });
    res.status(200).json({ status: 'success', count: zones.length, data: { zones: zones.map(withScores) } });
  } catch (error) { next(error); }
};

export const queryZones = async (req, res, next) => {
  try {
    const { island, category, subcategory, maxBortle, minAltitude, accessType, priority, minScore, limit = 20 } = req.query;
    const where = { is_active: true };
    if (island) where.island = island;
    if (category) where.category = category;
    if (subcategory) where.subcategory = subcategory;
    if (maxBortle) where.bortle_scale = { [Op.lte]: parseInt(maxBortle) };
    if (minAltitude) where.altitude = { [Op.gte]: parseInt(minAltitude) };
    if (accessType) where.access_type = accessType;

    let zones = await SkyQualityZone.findAll({ where, order: [['name', 'ASC']] });
    let scored = zones.map(z => ({ ...z.dataValues, scores: calcGlobalScore(z) }));

    if (priority === 'photo') scored.sort((a, b) => b.scores.photo - a.scores.photo);
    else if (priority === 'tourism') scored.sort((a, b) => b.scores.tourism - a.scores.tourism);
    else scored.sort((a, b) => b.scores.global - a.scores.global);

    if (minScore) scored = scored.filter(z => z.scores.global >= parseInt(minScore));
    scored = scored.slice(0, parseInt(limit));

    res.status(200).json({ status: 'success', count: scored.length, query: req.query, data: { zones: scored } });
  } catch (error) { next(error); }
};

export const recommendTonight = async (req, res, next) => {
  try {
    const { island } = req.query;
    const where = { is_active: true };
    if (island) where.island = island;
    const zones = await SkyQualityZone.findAll({ where });
    const best = findBestZone(zones, { priority: 'astro', ...(island && { island }), maxBortle: 3 });
    res.status(200).json({
      status: 'success',
      recommendation: best.slice(0, 5),
      meta: { total: best.length, island: island || 'todas', priority: 'astro', timestamp: new Date().toISOString() }
    });
  } catch (error) { next(error); }
};

export const recommendForPhotography = async (req, res, next) => {
  try {
    const { island, subject } = req.query;
    const where = { is_active: true };
    if (island) where.island = island;
    let zones = await SkyQualityZone.findAll({ where });
    let scored = zones.map(z => ({ ...z.dataValues, scores: calcGlobalScore(z) }));
    if (subject === 'milky_way') scored.sort((a, b) => (b.milky_way_quality || 0) - (a.milky_way_quality || 0));
    else scored.sort((a, b) => b.scores.photo - a.scores.photo);
    res.status(200).json({
      status: 'success',
      recommendation: scored.slice(0, 5),
      meta: { total: scored.length, island: island || 'todas', subject: subject || 'general', timestamp: new Date().toISOString() }
    });
  } catch (error) { next(error); }
};

export const getZonesGeoJSON = async (req, res, next) => {
  try {
    const zones = await SkyQualityZone.findAll({ where: { is_active: true } });
    const features = zones.map(z => ({
      type: 'Feature',
      properties: { id: z.id, name: z.name, island: z.island, category: z.category, bortle: z.bortle_scale, altitude: z.altitude, access: z.access_type, has_parking: z.has_parking },
      geometry: { type: 'Point', coordinates: [parseFloat(z.longitude), parseFloat(z.latitude)] }
    }));
    res.status(200).json({
      type: 'FeatureCollection',
      metadata: {
        title: 'AdAstra Sky — Zonas de Observación Astronómica',
        source: 'AdAstra Sky Platform · Canary Islands Observatory Network',
        exported_at: new Date().toISOString(),
        total_zones: zones.length,
        url: 'https://adastra-sky.vercel.app',
      },
      features,
    });
  } catch (error) { next(error); }
};

export const getAllZonesCSV = async (req, res, next) => {
  try {
    const zones = await SkyQualityZone.findAll({ where: { is_active: true } });
    const now = new Date();
    const banner = [
      '# ============================================================',
      '# ADASTRA SKY — Zonas de Observación Astronómica',
      '# Canary Islands Observatory Network',
      '# Exportado: ' + now.toISOString().slice(0, 10),
      '# Total zonas: ' + zones.length,
      '# Web: https://adastra-sky.vercel.app',
      '# ============================================================',
      '#',
    ].join('\n');
    const header = 'id,name,island,municipality,category,subcategory,latitude,longitude,altitude,bortle_scale,access_type,has_parking,has_bathrooms,has_cafe,has_mobile_coverage,safety_risk,astro_score,photo_score,tourism_score,global_score';
    const rows = zones.map(z => {
      const s = calcGlobalScore(z);
      return `"${z.id}","${z.name}","${z.island}","${z.municipality || ''}","${z.category}","${z.subcategory || ''}",${z.latitude},${z.longitude},${z.altitude},${z.bortle_scale},"${z.access_type || ''}",${z.has_parking},${z.has_bathrooms},${z.has_cafe},${z.has_mobile_coverage},${z.safety_risk},${s.astro},${s.photo},${s.tourism},${s.global}`;
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=adastra_zones.csv');
    res.status(200).send(banner + '\n' + [header, ...rows].join('\n'));
  } catch (error) { next(error); }
};

export const getAllZonesPDF = async (req, res, next) => {
  try {
    const zones = await SkyQualityZone.findAll({ where: { is_active: true }, order: [['island', 'ASC'], ['name', 'ASC']] });
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=adastra_zones.pdf');
    doc.pipe(res);

    const primary = '#06B6D4';
    const dark = '#0F172A';
    const gray = '#64748B';

    doc.rect(0, 0, doc.page.width, 140).fill(dark);
    doc.fontSize(28).font('Helvetica-Bold').fillColor(primary).text('ADASTRA SKY', 50, 35);
    doc.fontSize(11).font('Helvetica').fillColor('#94A3B8').text('Canary Islands Observatory Network', 50, 70);
    doc.fontSize(9).fillColor(gray).text('Red de zonas de observación astronómica · ' + new Date().toISOString().slice(0, 10), 50, 90);
    doc.fontSize(9).fillColor(gray).text('https://adastra-sky.vercel.app', 50, 105);

    const total = zones.length;
    const bortle1 = zones.filter(z => z.bortle_scale <= 2).length;
    const observatories = zones.filter(z => z.category === 'observatory').length;
    const viewpoints = zones.filter(z => z.category === 'astronomical_viewpoint').length;
    const islands = [...new Set(zones.map(z => z.island))];

    doc.fontSize(14).font('Helvetica-Bold').fillColor(primary).text('Resumen', 50, 170);
    doc.fontSize(10).font('Helvetica').fillColor('#E2E8F0');
    const stats = [
      `Total zonas: ${total}`,
      `Observatorios: ${observatories}`,
      `Miradores astronómicos: ${viewpoints}`,
      `Santuarios Bortle 1-2: ${bortle1}`,
      `Islas: ${islands.length}`,
    ];
    stats.forEach((s, i) => doc.text(s, 50, 195 + i * 16));

    doc.fontSize(14).font('Helvetica-Bold').fillColor(primary).text('Zonas por isla', 50, 300);

    let y = 325;
    const pageHeight = doc.page.height - 50;
    const colWidth = 220;
    const leftX = 50;
    let col = 0;

    islands.sort().forEach((island) => {
      const islandZones = zones.filter(z => z.island === island);
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 50;
        col = 0;
      }
      const x = leftX + col * (colWidth + 30);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(primary).text(island, x, y);
      y += 16;

      islandZones.forEach((zone) => {
        if (y > pageHeight - 16) {
          if (col === 0) {
            col = 1;
            y = 325;
          } else {
            doc.addPage();
            y = 50;
            col = 0;
          }
          doc.fontSize(10).font('Helvetica-Bold').fillColor(primary).text(island, x, y);
          y += 16;
        }
        const cat = zone.category === 'observatory' ? '🔭' : zone.category === 'astronomical_viewpoint' ? '🌌' : '🏞️';
        const bortleLabel = 'B' + zone.bortle_scale;
        doc.fontSize(8).font('Helvetica').fillColor('#E2E8F0').text(`  ${cat} ${zone.name}  [${bortleLabel}]`, x, y);
        y += 13;
      });
      y += 8;
    });

    doc.fontSize(8).fillColor(gray).text('Generado por AdAstra Sky · ' + new Date().toISOString().slice(0, 10), 50, doc.page.height - 30);

    doc.end();
  } catch (error) { next(error); }
};
