/**
 * Eventos astronómicos calculados (no hay fechas escritas a mano).
 *
 * Motor: Astronomy Engine (MIT, https://github.com/cosinekitty/astronomy),
 * precisión de ~1 minuto de arco. Lluvias de meteoros: longitudes solares de
 * máximo publicadas por la International Meteor Organization (IMO).
 *
 * Se calculan para un observador en Canarias:
 *  - Fases lunares principales y superlunas (Luna llena a < 361 000 km).
 *  - Eclipses lunares (visibles si la Luna está sobre el horizonte) y solares
 *    locales (solo los que se ven desde Canarias).
 *  - Oposiciones de planetas exteriores.
 *  - Conjunciones entre planetas brillantes (< 2°, lejos del Sol).
 *  - Equinoccios y solsticios.
 *
 * Los cometas no se incluyen: su brillo no se puede predecir con fiabilidad
 * sin efemérides específicas (el antiguo «C/2026 A3» no era un dato real).
 */

// Importación estática: Vercel solo incluye en el paquete las dependencias importadas así.
// En Jest se redirige a la build CommonJS (ver moduleNameMapper en jest.config.js).
import * as Astronomy from 'astronomy-engine';

const CANARIAS = new Astronomy.Observer(28.29, -16.63, 0);
const LANGS = ['es', 'en', 'de'];

// Longitud solar (J2000) del máximo, THZ y cuerpo progenitor (IMO Meteor Shower Calendar)
const METEOR_SHOWERS = [
  { id: 'quadrantids', names: ['Cuadrántidas', 'Quadrantids', 'Quadrantiden'], parent: '(196256) 2003 EH1', sol: 283.15, zhr: 110 },
  { id: 'lyrids', names: ['Líridas', 'Lyrids', 'Lyriden'], parent: 'C/1861 G1 (Thatcher)', sol: 32.32, zhr: 18 },
  { id: 'eta_aquariids', names: ['Eta Acuáridas', 'Eta Aquariids', 'Eta-Aquariiden'], parent: '1P/Halley', sol: 45.5, zhr: 50 },
  { id: 'south_delta_aquariids', names: ['Delta Acuáridas del Sur', 'Southern Delta Aquariids', 'Südliche Delta-Aquariiden'], parent: '96P/Machholz', sol: 127.0, zhr: 25 },
  { id: 'alpha_capricornids', names: ['Alfa Capricórnidas', 'Alpha Capricornids', 'Alpha-Capricorniden'], parent: '169P/NEAT', sol: 127.0, zhr: 5 },
  { id: 'perseids', names: ['Perseidas', 'Perseids', 'Perseiden'], parent: '109P/Swift-Tuttle', sol: 140.0, zhr: 100 },
  { id: 'orionids', names: ['Oriónidas', 'Orionids', 'Orioniden'], parent: '1P/Halley', sol: 208.0, zhr: 20 },
  { id: 'leonids', names: ['Leónidas', 'Leonids', 'Leoniden'], parent: '55P/Tempel-Tuttle', sol: 235.27, zhr: 15 },
  { id: 'geminids', names: ['Gemínidas', 'Geminids', 'Geminiden'], parent: '(3200) Phaethon', sol: 262.2, zhr: 150 },
  { id: 'ursids', names: ['Úrsidas', 'Ursids', 'Ursiden'], parent: '8P/Tuttle', sol: 270.7, zhr: 10 },
];

const PLANETS = {
  Mercury: ['Mercurio', 'Mercury', 'Merkur'],
  Venus: ['Venus', 'Venus', 'Venus'],
  Mars: ['Marte', 'Mars', 'Mars'],
  Jupiter: ['Júpiter', 'Jupiter', 'Jupiter'],
  Saturn: ['Saturno', 'Saturn', 'Saturn'],
  Uranus: ['Urano', 'Uranus', 'Uranus'],
  Neptune: ['Neptuno', 'Neptune', 'Neptun'],
};
const OUTER = ['Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
const BRIGHT = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

const T = {
  meteor: ['Lluvia de estrellas {name}', 'Meteor shower: {name}', 'Meteorstrom: {name}'],
  meteorDesc: ['Máximo de hasta {zhr} meteoros/hora en cielo ideal. Progenitor: {parent}.', 'Peak of up to {zhr} meteors/hour under ideal skies. Parent body: {parent}.', 'Maximum bis zu {zhr} Meteore/Stunde bei idealem Himmel. Ursprungskörper: {parent}.'],
  lunarEclipse: ['Eclipse lunar {kind}', '{kind} lunar eclipse', '{kind} Mondfinsternis'],
  lunarDesc: ['{vis}. Máximo a las {time} UTC.', '{vis}. Maximum at {time} UTC.', '{vis}. Maximum um {time} UTC.'],
  lunarVisible: ['Visible desde Canarias', 'Visible from the Canary Islands', 'Von den Kanaren sichtbar'],
  lunarNotVisible: ['No visible desde Canarias (la Luna está bajo el horizonte)', 'Not visible from the Canary Islands (Moon below the horizon)', 'Von den Kanaren nicht sichtbar (Mond unter dem Horizont)'],
  solarEclipse: ['Eclipse solar {kind} visible desde Canarias', '{kind} solar eclipse visible from the Canary Islands', '{kind} Sonnenfinsternis, sichtbar von den Kanaren'],
  solarDesc: ['Máximo a las {time} UTC con el Sol a {alt}° de altura. Usa siempre filtro solar homologado.', 'Maximum at {time} UTC with the Sun {alt}° high. Always use a certified solar filter.', 'Maximum um {time} UTC, Sonne {alt}° hoch. Immer zertifizierten Sonnenfilter verwenden.'],
  opposition: ['Oposición de {planet}', '{planet} at opposition', '{planet} in Opposition'],
  oppositionDesc: ['{planet} en oposición: máximo brillo y visible toda la noche.', '{planet} at opposition: brightest and visible all night.', '{planet} in Opposition: am hellsten und die ganze Nacht sichtbar.'],
  conjunction: ['Conjunción {a}-{b}', '{a}-{b} conjunction', 'Konjunktion {a}-{b}'],
  conjunctionDesc: ['{a} y {b} separados por {sep}°, a {elong}° del Sol.', '{a} and {b} {sep}° apart, {elong}° from the Sun.', '{a} und {b} {sep}° voneinander entfernt, {elong}° von der Sonne.'],
  supermoon: ['Superluna', 'Supermoon', 'Supermond'],
  supermoonDesc: ['Luna llena a {km} km de la Tierra, algo más grande y brillante de lo habitual.', 'Full Moon {km} km from Earth, slightly larger and brighter than usual.', 'Vollmond in {km} km Entfernung, etwas größer und heller als üblich.'],
  seasons: {
    mar: ['Equinoccio de marzo', 'March equinox', 'März-Tagundnachtgleiche'],
    jun: ['Solsticio de junio', 'June solstice', 'Juni-Sonnenwende'],
    sep: ['Equinoccio de septiembre', 'September equinox', 'September-Tagundnachtgleiche'],
    dec: ['Solsticio de diciembre', 'December solstice', 'Dezember-Sonnenwende'],
  },
  kinds: {
    total: ['total', 'Total', 'Totale'], partial: ['parcial', 'Partial', 'Partielle'],
    penumbral: ['penumbral', 'Penumbral', 'Halbschatten-'], annular: ['anular', 'Annular', 'Ringförmige'],
  },
  phases: [
    ['Nueva', 'New Moon', 'Neumond'], ['Creciente', 'Waxing crescent', 'Zunehmende Sichel'],
    ['Cuarto Creciente', 'First quarter', 'Erstes Viertel'], ['Gibosa Creciente', 'Waxing gibbous', 'Zunehmender Mond'],
    ['Llena', 'Full Moon', 'Vollmond'], ['Gibosa Menguante', 'Waning gibbous', 'Abnehmender Mond'],
    ['Cuarto Menguante', 'Last quarter', 'Letztes Viertel'], ['Menguante', 'Waning crescent', 'Abnehmende Sichel'],
  ],
};

const li = (lang) => Math.max(0, LANGS.indexOf(lang));
const fmt = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
const iso = (date) => date.toISOString().slice(0, 10);
const hhmm = (date) => date.toISOString().slice(11, 16);

function moonPhaseName(date, lang) {
  const angle = Astronomy.MoonPhase(date); // 0 = nueva, 180 = llena
  return T.phases[Math.round(angle / 45) % 8][li(lang)];
}

function base(id, type, date, name, description, lang, extra = {}) {
  return {
    id, name, type, date: iso(date), peak: iso(date), datetime_utc: date.toISOString(), description,
    hemisphere: 'Global', moon_phase: moonPhaseName(date, lang), source: 'astronomy_engine',
    visible_from_canarias: true, icon: type, ...extra,
  };
}

function meteorShowers(year, lang) {
  const out = [];
  // Las longitudes IMO son J2000; SearchSunLongitude usa el equinoccio de la fecha (+~1,4°/siglo)
  const precession = 1.397 * ((year - 2000) / 100);
  for (const s of METEOR_SHOWERS) {
    const start = Astronomy.MakeTime(new Date(Date.UTC(year, 0, 1)));
    const t = Astronomy.SearchSunLongitude((s.sol + precession) % 360, start, 366);
    if (!t || t.date.getUTCFullYear() !== year) continue;
    const name = s.names[li(lang)];
    out.push(base(`${s.id}_${year}`, 'meteor_shower', t.date, fmt(T.meteor[li(lang)], { name }),
      fmt(T.meteorDesc[li(lang)], { zhr: s.zhr, parent: s.parent }), lang, { icon: 'meteors', zhr: s.zhr, source: 'imo' }));
  }
  return out;
}

function eclipses(year, lang, from, to) {
  const out = [];
  let le = Astronomy.SearchLunarEclipse(from);
  while (le.peak.date < to) {
    const eq = Astronomy.Equator(Astronomy.Body.Moon, le.peak, CANARIAS, true, true);
    const hor = Astronomy.Horizon(le.peak, CANARIAS, eq.ra, eq.dec, 'normal');
    const visible = hor.altitude > 0;
    const kind = T.kinds[le.kind]?.[li(lang)] ?? le.kind;
    out.push(base(`lunar_eclipse_${iso(le.peak.date)}`, 'eclipse', le.peak.date, fmt(T.lunarEclipse[li(lang)], { kind }).trim(),
      fmt(T.lunarDesc[li(lang)], { vis: (visible ? T.lunarVisible : T.lunarNotVisible)[li(lang)], time: hhmm(le.peak.date) }), lang,
      { icon: 'eclipse', visible_from_canarias: visible, subtype: le.kind, kind: 'lunar' }));
    le = Astronomy.NextLunarEclipse(le.peak);
  }
  let se = Astronomy.SearchLocalSolarEclipse(from, CANARIAS);
  while (se.peak.time.date < to) {
    if (se.peak.altitude > 0) {
      const kind = T.kinds[se.kind]?.[li(lang)] ?? se.kind;
      out.push(base(`solar_eclipse_${iso(se.peak.time.date)}`, 'eclipse', se.peak.time.date, fmt(T.solarEclipse[li(lang)], { kind }).trim(),
        fmt(T.solarDesc[li(lang)], { time: hhmm(se.peak.time.date), alt: Math.round(se.peak.altitude) }), lang,
        { icon: 'eclipse', subtype: se.kind, kind: 'solar' }));
    }
    se = Astronomy.NextLocalSolarEclipse(se.peak.time, CANARIAS);
  }
  return out;
}

function oppositions(lang, from, to) {
  const out = [];
  for (const p of OUTER) {
    let t = Astronomy.SearchRelativeLongitude(p, 0, from);
    while (t.date < to) {
      const planet = PLANETS[p][li(lang)];
      out.push(base(`${p.toLowerCase()}_opposition_${iso(t.date)}`, 'planetary', t.date, fmt(T.opposition[li(lang)], { planet }),
        fmt(T.oppositionDesc[li(lang)], { planet }), lang, { icon: 'planets' }));
      t = Astronomy.SearchRelativeLongitude(p, 0, t.AddDays(30));
    }
  }
  return out;
}

function conjunctions(lang, from, to) {
  const out = [];
  const days = Math.ceil((to.date - from.date) / 86400000);
  for (let i = 0; i < BRIGHT.length; i++) {
    for (let j = i + 1; j < BRIGHT.length; j++) {
      const a = BRIGHT[i];
      const b = BRIGHT[j];
      const sep = (d) => {
        const t = from.AddDays(d);
        return Astronomy.AngleBetween(Astronomy.GeoVector(a, t, true), Astronomy.GeoVector(b, t, true));
      };
      let prev = sep(-1);
      let cur = sep(0);
      for (let d = 0; d <= days; d++) {
        const next = sep(d + 1);
        if (cur < prev && cur <= next && cur < 2.0) {
          const t = from.AddDays(d);
          const elong = Math.min(Astronomy.AngleFromSun(a, t), Astronomy.AngleFromSun(b, t));
          if (elong > 15) {
            const na = PLANETS[a][li(lang)];
            const nb = PLANETS[b][li(lang)];
            out.push(base(`conjunction_${a}_${b}_${iso(t.date)}`.toLowerCase(), 'conjunction', t.date,
              fmt(T.conjunction[li(lang)], { a: na, b: nb }),
              fmt(T.conjunctionDesc[li(lang)], { a: na, b: nb, sep: cur.toFixed(1), elong: Math.round(elong) }), lang,
              { icon: 'conjunction', separation_deg: Number(cur.toFixed(2)) }));
          }
        }
        prev = cur;
        cur = next;
      }
    }
  }
  return out;
}

function supermoons(lang, from, to) {
  const out = [];
  let mq = Astronomy.SearchMoonQuarter(from);
  while (mq.time.date < to) {
    if (mq.quarter === 2) {
      const km = Astronomy.GeoMoon(mq.time).Length() * Astronomy.KM_PER_AU;
      if (km < 361000) {
        out.push(base(`supermoon_${iso(mq.time.date)}`, 'supermoon', mq.time.date, T.supermoon[li(lang)],
          fmt(T.supermoonDesc[li(lang)], { km: Math.round(km).toLocaleString(lang) }), lang, { icon: 'supermoon', distance_km: Math.round(km) }));
      }
    }
    mq = Astronomy.NextMoonQuarter(mq);
  }
  return out;
}

function seasons(year, lang) {
  const s = Astronomy.Seasons(year);
  return [['mar', s.mar_equinox], ['jun', s.jun_solstice], ['sep', s.sep_equinox], ['dec', s.dec_solstice]]
    .map(([k, t]) => base(`${k}_${year}`, 'seasonal', t.date, T.seasons[k][li(lang)], '', lang, { icon: 'seasonal' }));
}

const cache = new Map();

export function generateEventsForYear(year, lang = 'es') {
  const key = `${year}:${lang}`;
  if (cache.has(key)) return cache.get(key);
  const from = Astronomy.MakeTime(new Date(Date.UTC(year, 0, 1)));
  const to = Astronomy.MakeTime(new Date(Date.UTC(year + 1, 0, 1)));
  const events = [
    ...meteorShowers(year, lang),
    ...eclipses(year, lang, from, to.date),
    ...oppositions(lang, from, to.date),
    ...conjunctions(lang, from, to),
    ...supermoons(lang, from, to.date),
    ...seasons(year, lang),
  ].sort((a, b) => a.datetime_utc.localeCompare(b.datetime_utc));
  if (cache.size > 50) cache.clear();
  cache.set(key, events);
  return events;
}

export function generateEventsForMonth(year, month, lang = 'es') {
  return generateEventsForYear(year, lang).filter((e) => {
    const [y, m] = e.date.split('-').map(Number);
    return y === year && m === month;
  });
}
