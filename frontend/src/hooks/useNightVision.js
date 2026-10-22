import { useCallback, useEffect, useState } from 'react';

// Modo de visión nocturna: tiñe toda la app de rojo para no perder la adaptación
// del ojo a la oscuridad durante la observación (la luz roja apenas afecta a los bastones).
const STORAGE_KEY = 'adastra.nightVision';
const CLASS_NAME = 'night-vision';
const EVENT = 'adastra:night-vision';

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const applyStoredNightVision = () => {
  document.documentElement.classList.toggle(CLASS_NAME, readStored());
};

export default function useNightVision() {
  const [enabled, setEnabled] = useState(readStored);

  useEffect(() => {
    document.documentElement.classList.toggle(CLASS_NAME, enabled);
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    } catch {
      /* sin almacenamiento: el modo dura hasta recargar */
    }
  }, [enabled]);

  // Mantiene sincronizados todos los botones (la barra lateral se monta en escritorio y en móvil)
  useEffect(() => {
    const onChange = (e) => setEnabled(e.detail);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains(CLASS_NAME);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
  }, []);
  return { enabled, toggle };
}
