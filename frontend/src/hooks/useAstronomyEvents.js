/**
 * Eventos astronómicos calculados por el backend (GET /api/events).
 * Sustituye a la antigua lista fija del frontend, que tenía fechas erróneas.
 */
import { useEffect, useState } from 'react';
import { API_URL } from '../config/api';

export function useAstronomyEvents({ year, lang = 'es', includeNextYear = false }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const years = includeNextYear ? [year, year + 1] : [year];
    setLoading(true);
    setError(false);
    Promise.all(years.map((y) =>
      fetch(`${API_URL}/api/events?year=${y}&lang=${lang}`, { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((d) => (d.success ? d.data : []))
    ))
      .then((lists) => setEvents(lists.flat()))
      .catch((e) => { if (e.name !== 'AbortError') { setEvents([]); setError(true); } })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [year, lang, includeNextYear]);

  return { events, loading, error };
}
