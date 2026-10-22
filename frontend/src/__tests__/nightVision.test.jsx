import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useNightVision, { applyStoredNightVision } from '../hooks/useNightVision';

describe('useNightVision', () => {
  beforeEach(() => {
    // El setup global simula localStorage sin guardar nada: aquí hace falta uno real en memoria
    const store = new Map();
    localStorage.getItem.mockImplementation((k) => (store.has(k) ? store.get(k) : null));
    localStorage.setItem.mockImplementation((k, v) => store.set(k, String(v)));
    document.documentElement.classList.remove('night-vision');
  });

  it('activa y desactiva la clase y la recuerda', () => {
    const { result } = renderHook(() => useNightVision());
    expect(result.current.enabled).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.enabled).toBe(true);
    expect(document.documentElement.classList.contains('night-vision')).toBe(true);
    expect(localStorage.getItem('adastra.nightVision')).toBe('1');
    act(() => result.current.toggle());
    expect(document.documentElement.classList.contains('night-vision')).toBe(false);
  });

  it('sincroniza varias instancias', () => {
    const a = renderHook(() => useNightVision());
    const b = renderHook(() => useNightVision());
    act(() => a.result.current.toggle());
    expect(b.result.current.enabled).toBe(true);
  });

  it('aplica el valor guardado al arrancar', () => {
    localStorage.setItem('adastra.nightVision', '1');
    applyStoredNightVision();
    expect(document.documentElement.classList.contains('night-vision')).toBe(true);
  });
});
