export function getLunarPhase(date = new Date()) {
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const synodicMonth = 29.53058867;
  const diff = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
  const age = ((diff % synodicMonth) + synodicMonth) % synodicMonth;
  const illumination = Math.round(((1 - Math.cos(2 * Math.PI * age / synodicMonth)) / 2) * 100);

  const phaseIndex = Math.round(age / synodicMonth * 8) % 8;
  const emojis = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

  const phaseNames = {
    es: ['Luna Nueva', 'Creciente', 'Cuarto Creciente', 'Gibosa Creciente', 'Luna Llena', 'Gibosa Menguante', 'Cuarto Menguante', 'Menguante'],
    en: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'],
    de: ['Neumond', 'Zunehmende Sichel', 'Erstes Viertel', 'Zunehmender Mond', 'Vollmond', 'Abnehmender Mond', 'Letztes Viertel', 'Abnehmende Sichel'],
  };

  const daysUntilFull = (8 - phaseIndex) % 8 === 0 ? 0 : (8 - phaseIndex) % 8;
  const nextFullDate = new Date(date);
  nextFullDate.setDate(nextFullDate.getDate() + daysUntilFull * 3.691);

  return {
    emoji: emojis[phaseIndex],
    name: phaseNames,
    phaseIndex,
    illumination,
    nextFullDate,
    age: Math.round(age),
  };
}

export function calculateSkyScore(zones) {
  if (!zones || zones.length === 0) return { score: 0, level: 'none', label: 'Sin datos' };
  const avgBortle = zones.reduce((s, z) => s + z.bortle_scale, 0) / zones.length;
  const score = Math.round(((9 - avgBortle) / 8) * 100) / 10;
  if (score >= 8) return { score, level: 'excellent', label: 'Excelente' };
  if (score >= 6) return { score, level: 'good', label: 'Buena' };
  if (score >= 4) return { score, level: 'fair', label: 'Regular' };
  return { score, level: 'poor', label: 'Mala' };
}

export function getNextEvent(events = []) {
  if (!events || events.length === 0) {
    return {
      name: 'Próximo Evento',
      date: new Date(Date.now() + 7 * 86400000),
      description: 'No hay eventos próximos programados',
      type: 'general',
    };
  }
  return events[0];
}

export function scoreLabel(skyScore) {
  if (!skyScore || typeof skyScore.score === 'undefined') return 'Sin datos';
  if (skyScore.score >= 8) return 'Excelente';
  if (skyScore.score >= 6) return 'Buena';
  if (skyScore.score >= 4) return 'Regular';
  return 'Mala';
}

export function getSeasonFromMonth(month) {
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

export function formatSkyScore(score) {
  if (typeof score === 'number') return score.toFixed(1);
  if (score && typeof score === 'object' && typeof score.score === 'number') return score.score.toFixed(1);
  return String(score ?? '0');
}

export function getGreeting(lang = 'es') {
  const hour = new Date().getHours();
  const greetings = {
    es: [['Buenas noches', 'Buenos días', 'Buenas tardes', 'Buenas noches']],
    en: [['Good night', 'Good morning', 'Good afternoon', 'Good evening']],
    de: [['Gute Nacht', 'Guten Morgen', 'Guten Tag', 'Guten Abend']],
  };
  const idx = hour < 6 ? 0 : hour < 12 ? 1 : hour < 20 ? 2 : 3;
  return greetings[lang]?.[0]?.[idx] || greetings.es[0][idx];
}
