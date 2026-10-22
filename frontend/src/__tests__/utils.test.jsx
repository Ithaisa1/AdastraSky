import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import RichText from '../components/RichText';
import { getNextEvent } from '../utils/astronomy';
import { assetUrl } from '../config/api';

describe('RichText', () => {
  it('formatea negritas, listas y enlaces seguros', () => {
    const { container } = render(<RichText text={'**Teide**\n- GREGOR\n- THEMIS\n[IAC](https://www.iac.es)'} />);
    expect(container.querySelector('strong').textContent).toBe('Teide');
    expect(container.querySelectorAll('li').length).toBe(2);
    const a = container.querySelector('a');
    expect(a.getAttribute('href')).toBe('https://www.iac.es');
    expect(a.getAttribute('rel')).toContain('noopener');
  });

  it('no interpreta HTML ni enlaces javascript:', () => {
    const { container } = render(<RichText text={'<img src=x onerror=alert(1)> [x](javascript:alert(1))'} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>');
  });
});

describe('getNextEvent', () => {
  const events = [
    { name: 'Pasado', date: '2026-01-10' },
    { name: 'Hoy', date: '2026-10-22' },
    { name: 'Futuro', date: '2026-12-14' },
  ];
  it('devuelve el primer evento desde hoy, no el primero de la lista', () => {
    expect(getNextEvent(events, new Date(2026, 9, 22, 20)).name).toBe('Hoy');
    expect(getNextEvent(events, new Date(2026, 9, 23)).name).toBe('Futuro');
  });
  it('devuelve null si no hay próximos', () => {
    expect(getNextEvent(events, new Date(2027, 0, 1))).toBeNull();
    expect(getNextEvent([])).toBeNull();
  });
});

describe('assetUrl', () => {
  it('convierte rutas relativas del backend en absolutas', () => {
    expect(assetUrl('/media/abc')).toMatch(/^https?:\/\/.+\/media\/abc$/);
    expect(assetUrl('https://x.org/a.jpg')).toBe('https://x.org/a.jpg');
    expect(assetUrl('')).toBe('');
  });
});
