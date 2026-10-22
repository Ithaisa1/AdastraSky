import { describe, it, expect } from 'vitest';
import es from '../locales/es.json';
import en from '../locales/en.json';
import de from '../locales/de.json';

// Aplana claves; en arrays usa el índice (las FAQ deben tener la misma estructura)
const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]);

const keys = (o) => new Set(flatten(o).map(([k]) => k));

describe('Traducciones', () => {
  it('es, en y de tienen exactamente las mismas claves', () => {
    const base = keys(es);
    for (const [name, locale] of [['en', en], ['de', de]]) {
      const other = keys(locale);
      expect([...base].filter((k) => !other.has(k)), `faltan en ${name}`).toEqual([]);
      expect([...other].filter((k) => !base.has(k)), `sobran en ${name}`).toEqual([]);
    }
  });

  it('ningún texto está vacío', () => {
    for (const locale of [es, en, de]) {
      expect(flatten(locale).filter(([, v]) => typeof v === 'string' && !v.trim())).toEqual([]);
    }
  });

  it('las interpolaciones coinciden entre idiomas', () => {
    const vars = (s) => (typeof s === 'string' ? [...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort().join(',') : '');
    const enMap = Object.fromEntries(flatten(en));
    const deMap = Object.fromEntries(flatten(de));
    for (const [k, v] of flatten(es)) {
      expect(vars(enMap[k]), `en:${k}`).toBe(vars(v));
      expect(vars(deMap[k]), `de:${k}`).toBe(vars(v));
    }
  });

  it('no hay textos en español dentro de las traducciones inglesa o alemana', () => {
    const spanishOnly = /[¿¡ñ]|\b(el|los|las|del|para|con|una)\b/i;
    const suspicious = (locale) => flatten(locale)
      .filter(([, v]) => typeof v === 'string' && spanishOnly.test(v))
      // nombres propios en español aceptables
      .filter(([, v]) => !/Roque de los Muchachos|Ley del Cielo|Instituto de Astrofísica|Español|Santa Cruz|La Palma|España/.test(v));
    expect(suspicious(en)).toEqual([]);
    expect(suspicious(de)).toEqual([]);
  });
});
