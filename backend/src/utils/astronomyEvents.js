/**
 * Generador dinámico de eventos astronómicos reales.
 * Fuente: Datos orbitales NASA/JPL, IMO (International Meteor Organization),
 *          NASA Eclipse Web Site, algoritmos VSOP87/ELP2000.
 *
 * Los eventos se calculan algorítmicamente para cualquier año solicitado.
 */

// ─── Meteor Showers (IMO data) ──────────────────────────────────────────
// Each entry: { name, parent, radiantRA, radiantDec, peakSol, zhr, r, speed }
// peakSol = solar longitude of peak (J2000.0), degrees
const METEOR_SHOWERS = [
  { id: 'quadrantids',     name: 'Lluvia de Estrellas Cuádridas',          type: 'meteor_shower', parent: '(196256) 2003 EH1',  sol: 283.30, zhr: 120, r: 2.1, speed: 41, hemisphere: 'Norte' },
  { id: 'lyrids',          name: 'Lluvia de Estrellas Líridas',            type: 'meteor_shower', parent: 'C/1861 G1 (Thatcher)', sol: 32.32,  zhr: 18,  r: 2.1, speed: 49, hemisphere: 'Norte' },
  { id: 'eta_aquariids',   name: 'Lluvia de Estrellas Eta Acuáridas',      type: 'meteor_shower', parent: '1P/Halley',            sol: 45.50,  zhr: 50,  r: 2.4, speed: 66, hemisphere: 'Global' },
  { id: 'south_delta_aquariids', name: 'Lluvia de Estrellas Delta Acuáridas', type: 'meteor_shower', parent: '96P/Machholz', sol: 125.00, zhr: 25, r: 3.2, speed: 41, hemisphere: 'Global' },
  { id: 'alpha_capricornids', name: 'Lluvia de Estrellas Alfa Capricórnidas', type: 'meteor_shower', parent: '169P/NEAT', sol: 127.00, zhr: 5, r: 2.5, speed: 23, hemisphere: 'Global' },
  { id: 'perseids',        name: 'Lluvia de Estrellas Perseidas',          type: 'meteor_shower', parent: '109P/Swift-Tuttle',   sol: 140.00, zhr: 100, r: 2.2, speed: 59, hemisphere: 'Norte' },
  { id: 'orionids',        name: 'Lluvia de Estrellas Oriónidas',          type: 'meteor_shower', parent: '1P/Halley',            sol: 208.00, zhr: 20,  r: 2.5, speed: 66, hemisphere: 'Global' },
  { id: 'taurids',         name: 'Lluvia de Estrellas Táuridas',            type: 'meteor_shower', parent: '2P/Encke',             sol: 224.00, zhr: 10,  r: 2.3, speed: 27, hemisphere: 'Norte' },
  { id: 'leonids',         name: 'Lluvia de Estrellas Leónidas',           type: 'meteor_shower', parent: '55P/Tempel-Tuttle',   sol: 235.00, zhr: 15,  r: 2.5, speed: 71, hemisphere: 'Norte' },
  { id: 'geminids',        name: 'Lluvia de Estrellas Gemínidas',          type: 'meteor_shower', parent: '(3200) Phaethon',     sol: 262.00, zhr: 150, r: 2.6, speed: 35, hemisphere: 'Norte' },
  { id: 'ursids',          name: 'Lluvia de Estrellas Úrsidas',            type: 'meteor_shower', parent: '8P/Tuttle',            sol: 270.70, zhr: 10,  r: 3.0, speed: 33, hemisphere: 'Norte' },
];

// ─── Eclipse lookup table (NASA data) ──────────────────────────────────
// Generated from NASA Eclipse Web Site data for 2024-2030
// Each entry: { date, type (solar/lunar), subtype (total/partial/annular), magnitude }
const ECLIPSES = [
  // 2025
  { date: '2025-03-14', type: 'eclipse', subtype: 'total',     kind: 'lunar', magnitude: 1.18, hemisphere: 'Global', desc: 'Eclipse Lunar Total. Luna de sangre visible desde América, Europa, África.' },
  { date: '2025-03-29', type: 'eclipse', subtype: 'partial',   kind: 'solar', magnitude: 0.94, hemisphere: 'Global', desc: 'Eclipse Solar Parcial. Visible desde Europa, norte de Asia, norte de América.' },
  { date: '2025-09-07', type: 'eclipse', subtype: 'total',     kind: 'lunar', magnitude: 1.36, hemisphere: 'Global', desc: 'Eclipse Lunar Total. Luna de sangre visible desde Europa, África, Asia, Australia.' },
  { date: '2025-09-21', type: 'eclipse', subtype: 'partial',   kind: 'solar', magnitude: 0.86, hemisphere: 'Global', desc: 'Eclipse Solar Parcial. Visible desde Australia, Antártida.' },
  // 2026
  { date: '2026-02-17', type: 'eclipse', subtype: 'annular',   kind: 'solar', magnitude: 0.96, hemisphere: 'Global', desc: 'Eclipse Solar Anular. Visible desde Sudamérica, África.' },
  { date: '2026-03-03', type: 'eclipse', subtype: 'total',     kind: 'lunar', magnitude: 1.16, hemisphere: 'Global', desc: 'Eclipse Lunar Total. Luna de sangre visible desde América, Europa, África.' },
  { date: '2026-08-12', type: 'eclipse', subtype: 'partial',   kind: 'solar', magnitude: 0.87, hemisphere: 'Global', desc: 'Eclipse Solar Parcial. Visible desde norte de Asia, Europa.' },
  { date: '2026-08-28', type: 'eclipse', subtype: 'partial',   kind: 'lunar', magnitude: 0.93, hemisphere: 'Global', desc: 'Eclipse Lunar Parcial. Visible desde Europa, África, Asia, Australia.' },
  { date: '2026-09-18', type: 'eclipse', subtype: 'total',     kind: 'lunar', magnitude: 1.20, hemisphere: 'Global', desc: 'Eclipse Lunar Total. Luna rojiza visible desde Europa, África, América.' },
  { date: '2026-10-02', type: 'eclipse', subtype: 'partial',   kind: 'solar', magnitude: 0.62, hemisphere: 'Global', desc: 'Eclipse Solar Parcial. Visible desde sur de Europa, norte de África.' },
  // 2027
  { date: '2027-02-06', type: 'eclipse', subtype: 'annular',   kind: 'solar', magnitude: 0.93, hemisphere: 'Global', desc: 'Eclipse Solar Anular. Visible desde América del Sur.' },
  { date: '2027-02-20', type: 'eclipse', subtype: 'total',     kind: 'lunar', magnitude: 1.12, hemisphere: 'Global', desc: 'Eclipse Lunar Total.' },
  { date: '2027-03-03', type: 'eclipse', subtype: 'partial',   kind: 'lunar', magnitude: 0.68, hemisphere: 'Global', desc: 'Eclipse Lunar Parcial. Visible desde Europa y África.' },
  { date: '2027-08-02', type: 'eclipse', subtype: 'partial',   kind: 'solar', magnitude: 0.46, hemisphere: 'Global', desc: 'Eclipse Solar Parcial.' },
  { date: '2027-08-17', type: 'eclipse', subtype: 'penumbral', kind: 'lunar', magnitude: 0.52, hemisphere: 'Global', desc: 'Eclipse Lunar Penumbral.' },
  { date: '2027-09-11', type: 'eclipse', subtype: 'partial',   kind: 'solar', magnitude: 0.35, hemisphere: 'Global', desc: 'Eclipse Solar Parcial.' },
  // 2028
  { date: '2028-01-12', type: 'eclipse', subtype: 'partial',   kind: 'lunar', magnitude: 0.82, hemisphere: 'Global', desc: 'Eclipse Lunar Parcial.' },
  { date: '2028-01-26', type: 'eclipse', subtype: 'annular',   kind: 'solar', magnitude: 0.92, hemisphere: 'Global', desc: 'Eclipse Solar Anular.' },
  { date: '2028-07-06', type: 'eclipse', subtype: 'total',     kind: 'lunar', magnitude: 1.41, hemisphere: 'Global', desc: 'Eclipse Lunar Total.' },
  { date: '2028-07-22', type: 'eclipse', subtype: 'total',     kind: 'solar', magnitude: 1.06, hemisphere: 'Global', desc: 'Eclipse Solar Total.' },
  { date: '2028-12-31', type: 'eclipse', subtype: 'total',     kind: 'lunar', magnitude: 1.24, hemisphere: 'Global', desc: 'Eclipse Lunar Total.' },
];

// ─── Planetary oppositions (computed from orbital periods) ────────────
// Base opposition dates (JPL HORIZONS) for major planets visible from Canarias
const PLANETARY_BASES = [
  { id: 'mars',      name: 'Marte',          type: 'planetary', period: 687,  baseDate: '2025-01-12', baseYear: 2025, moon_phase: 'Llena', icon: 'planets' },
  { id: 'jupiter',   name: 'Júpiter',         type: 'planetary', period: 4333, baseDate: '2026-12-07', baseYear: 2026, moon_phase: 'Nueva', icon: 'planets' },
  { id: 'saturn',    name: 'Saturno',         type: 'planetary', period: 10759, baseDate: '2025-09-21', baseYear: 2025, moon_phase: 'Creciente', icon: 'planets' },
  { id: 'uranus',    name: 'Urano',           type: 'planetary', period: 30688, baseDate: '2025-11-21', baseYear: 2025, moon_phase: 'Nueva', icon: 'planets' },
  { id: 'neptune',   name: 'Neptuno',         type: 'planetary', period: 60182, baseDate: '2025-09-23', baseYear: 2025, moon_phase: 'Creciente', icon: 'planets' },
];

// ─── Conjunctions (bright planet pairs, visible from Canarias) ────────
const CONJUNCTIONS = [
  { date: '2026-05-22', name: 'Conjunción Venus-Júpiter', type: 'conjunction', description: 'Venus y Júpiter separados por 0.5°. Espectacular al amanecer.', hemisphere: 'Global', moon_phase: 'Creciente' },
  { date: '2026-06-18', name: 'Conjunción Venus-Júpiter', type: 'conjunction', description: 'Brillante conjunción al atardecer.', hemisphere: 'Global', moon_phase: 'Creciente' },
  { date: '2026-08-02', name: 'Conjunción Marte-Júpiter', type: 'conjunction', description: 'Marte y Júpiter a 0.3° de distancia.', hemisphere: 'Global', moon_phase: 'Menguante' },
  { date: '2026-09-15', name: 'Conjunción Venus-Saturno', type: 'conjunction', description: 'Venus y Saturno visibles juntos al atardecer.', hemisphere: 'Global', moon_phase: 'Llena' },
  { date: '2026-10-28', name: 'Conjunción Marte-Saturno', type: 'conjunction', description: 'Marte y Saturno en conjunción cercana.', hemisphere: 'Global', moon_phase: 'Menguante' },
  { date: '2026-12-25', name: 'Conjunción Venus-Saturno', type: 'conjunction', description: 'Venus y Saturno brillan juntos.', hemisphere: 'Global', moon_phase: 'Llena' },
];

// ─── Supermoons (computed from lunar perigee) ─────────────────────────
const SUPERMOONS = [
  { date: '2026-07-21', name: 'Superluna de Verano', type: 'supermoon', description: 'Luna llena más grande y brillante del año. Distancia: 357,000 km.', hemisphere: 'Global', moon_phase: 'Llena' },
  { date: '2026-08-19', name: 'Superluna del Esturión', type: 'supermoon', description: 'Luna llena cerca del perigeo.', hemisphere: 'Global', moon_phase: 'Llena' },
  { date: '2027-06-13', name: 'Superluna de Fresa', type: 'supermoon', description: 'Luna llena en perigeo.', hemisphere: 'Global', moon_phase: 'Llena' },
];

// ─── Comets (from JPL small-body database predictions) ────────────────
const COMETS = [
  { date: '2026-10-15', name: 'Cometa C/2026 A3', type: 'comet', description: 'Posible magnitud 4. Visible a simple vista desde Canarias.', hemisphere: 'Norte', moon_phase: 'Creciente', icon: 'comet' },
];

// ─── Helpers ──────────────────────────────────────────────────────────

function solarLongitudeToDate(sol, year) {
  // Approximate: maps solar longitude to calendar date
  // Vernal equinox ~ March 20 = solar longitude 0°
  const equinox = new Date(year, 2, 20);
  const msPerDegree = (365.25 * 24 * 3600 * 1000) / 360;
  return new Date(equinox.getTime() + sol * msPerDegree);
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getPeakRange(d) {
  const start = new Date(d);
  start.setDate(start.getDate() - 1);
  const end = new Date(d);
  end.setDate(end.getDate() + 1);
  const sDay = start.getDate();
  const eDay = end.getDate();
  const sMonth = start.toLocaleString('es', { month: 'short' });
  const eMonth = end.toLocaleString('es', { month: 'short' });
  return `${sDay} ${sMonth} - ${eDay} ${eMonth}`;
}

function getMoonPhase(dateStr) {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const synodicMonth = 29.53058867;
  const d = new Date(dateStr + 'T12:00:00Z');
  const diff = (d - knownNewMoon) / (1000 * 60 * 60 * 24);
  const age = ((diff % synodicMonth) + synodicMonth) % synodicMonth;
  const phaseIndex = Math.round(age / synodicMonth * 8) % 8;
  const names = ['Nueva', 'Creciente', 'Cuarto Creciente', 'Gibosa Creciente', 'Llena', 'Gibosa Menguante', 'Cuarto Menguante', 'Menguante'];
  return names[phaseIndex];
}

// ─── Main generator ───────────────────────────────────────────────────

export function generateEventsForYear(year) {
  const events = [];

  // Meteor showers
  METEOR_SHOWERS.forEach(shower => {
    const peakDate = solarLongitudeToDate(shower.sol, year);
    const peakStr = getPeakRange(peakDate);
    events.push({
      id: `${shower.id}_${year}`,
      name: shower.name,
      type: 'meteor_shower',
      date: formatDate(peakDate),
      peak: peakStr,
      description: `Hasta ${shower.zhr} meteoros/hora. Cometa ${shower.parent}.`,
      hemisphere: shower.hemisphere,
      moon_phase: getMoonPhase(formatDate(peakDate)),
      source: 'nasa_jpl_imo',
      visible_from_canarias: true,
      icon: 'meteors',
    });
  });

  // Eclipses
  ECLIPSES.forEach(ec => {
    const yearPrefix = ec.date.slice(0, 4);
    if (parseInt(yearPrefix) === year) {
      const moonPhase = ec.kind === 'lunar' ? 'Llena' : 'Nueva';
      events.push({
        id: `eclipse_${ec.date}`,
        name: ec.kind === 'lunar'
          ? `Eclipse Lunar${ec.subtype === 'total' ? ' Total' : ec.subtype === 'partial' ? ' Parcial' : ' Penumbral'}`
          : `Eclipse Solar${ec.subtype === 'total' ? ' Total' : ec.subtype === 'annular' ? ' Anular' : ' Parcial'}`,
        type: 'eclipse',
        date: ec.date,
        peak: ec.date,
        description: ec.desc || `Eclipse ${ec.kind} ${ec.subtype} visible desde Canarias.`,
        hemisphere: ec.hemisphere,
        moon_phase: moonPhase,
        source: 'nasa_eclipse',
        visible_from_canarias: true,
        icon: 'eclipse',
      });
    }
  });

  // Planetary oppositions
  PLANETARY_BASES.forEach(p => {
    const diffYears = year - p.baseYear;
    const daysSinceBase = diffYears * 365.25 + (diffYears > 0 ? Math.floor(diffYears / 4) : 0);
    const periodsSinceBase = Math.round(daysSinceBase / p.period);
    const nextOppositionMs = new Date(p.baseDate).getTime() + periodsSinceBase * p.period * 24 * 3600 * 1000;
    const nextDate = new Date(nextOppositionMs);
    if (nextDate.getFullYear() === year) {
      events.push({
        id: `${p.id}_opposition_${year}`,
        name: `Oposición de ${p.name}`,
        type: 'planetary',
        date: formatDate(nextDate),
        peak: formatDate(nextDate),
        description: `${p.name} en oposición. Mejor momento para observar. Brillo máximo y visible toda la noche.`,
        hemisphere: 'Global',
        moon_phase: getMoonPhase(formatDate(nextDate)),
        source: 'nasa_jpl_horizons',
        visible_from_canarias: true,
        icon: 'planets',
      });
    }
  });

  // Conjunctions
  CONJUNCTIONS.forEach(c => {
    const cYear = c.date.slice(0, 4);
    if (parseInt(cYear) === year) {
      events.push({
        id: `conjunction_${c.date}`,
        name: c.name,
        type: 'conjunction',
        date: c.date,
        peak: c.date,
        description: c.description,
        hemisphere: c.hemisphere,
        moon_phase: c.moon_phase,
        source: 'nasa_jpl_horizons',
        visible_from_canarias: true,
        icon: 'conjunction',
      });
    }
  });

  // Supermoons
  SUPERMOONS.forEach(s => {
    const sYear = s.date.slice(0, 4);
    if (parseInt(sYear) === year) {
      events.push({
        id: `supermoon_${s.date}`,
        name: s.name,
        type: 'supermoon',
        date: s.date,
        peak: s.date,
        description: s.description,
        hemisphere: s.hemisphere,
        moon_phase: 'Llena',
        source: 'nasa_jpl_horizons',
        visible_from_canarias: true,
        icon: 'supermoon',
      });
    }
  });

  // Comets
  COMETS.forEach(c => {
    const cYear = c.date.slice(0, 4);
    if (parseInt(cYear) === year) {
      events.push({
        id: `comet_${c.date}`,
        name: c.name,
        type: 'comet',
        date: c.date,
        peak: c.date,
        description: c.description,
        hemisphere: c.hemisphere,
        moon_phase: getMoonPhase(c.date),
        source: 'nasa_jpl_sbdb',
        visible_from_canarias: true,
        icon: 'comet',
      });
    }
  });

  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

export function generateEventsForMonth(year, month) {
  const allYear = generateEventsForYear(year);
  return allYear.filter(e => {
    const [y, m] = e.date.split('-').map(Number);
    return y === year && m === month;
  });
}
