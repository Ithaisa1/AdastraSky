import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider } from '../context/AuthContext';
import PlannerPage from '../pages/PlannerPage';

vi.mock('axios', () => {
  const axios = { get: vi.fn(), post: vi.fn(), defaults: { headers: { common: {} } } };
  return { default: axios, ...axios };
});

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.localStorage.getItem.mockImplementation((k) => ({ adastra_session: 't', adastra_user: '{"id":"u1","role":"user"}' }[k] ?? null));
});

describe('PlannerPage', () => {
  it('pide el plan y muestra razones, confianza, limitaciones y fuentes', async () => {
    axios.post.mockResolvedValue({ data: { data: {
      ok: true, visible: true, summary: 'Mejor opción: Mirador Oscuro',
      recommendations: [{ zone: { name: 'Mirador Oscuro', island: 'Tenerife', altitude: 2300 }, night: '2026-10-24', window_local: '20:47–05:17',
        max_altitude: 63, direction: 'S', cloud_cover: 5, moon_illumination: 0.94, distance_km: 40, score: 95, confidence: 'high',
        reasons: ['Saturno estará sobre el horizonte de 20:47 a 05:17'] }],
      limitations: ['No garantiza un cielo despejado'], sources: [{ title: 'Open-Meteo', source: 'https://open-meteo.com' }],
    } } });
    render(<MemoryRouter><AuthProvider><PlannerPage /></AuthProvider></MemoryRouter>);
    fireEvent.click(screen.getByText('planner.submit'));
    expect(await screen.findByText('Mejor opción: Mirador Oscuro')).toBeDefined();
    expect(axios.post.mock.calls[0][1]).toMatchObject({ target: 'Saturno', when: 'weekend', language: 'es' });
    expect(screen.getByText('Saturno estará sobre el horizonte de 20:47 a 05:17')).toBeDefined();
    expect(screen.getByText('planner.confidence.high')).toBeDefined();
    expect(screen.getByText('No garantiza un cielo despejado')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Open-Meteo' }).getAttribute('href')).toBe('https://open-meteo.com');
  });

  it('muestra el mensaje cuando el objeto no es visible', async () => {
    axios.post.mockResolvedValue({ data: { data: { ok: true, visible: false, summary: 'Venus no es visible', recommendations: [], limitations: [], sources: [] } } });
    render(<MemoryRouter><AuthProvider><PlannerPage /></AuthProvider></MemoryRouter>);
    fireEvent.click(screen.getByText('planner.submit'));
    expect(await screen.findByText('Venus no es visible')).toBeDefined();
  });

  it('informa de los errores', async () => {
    axios.post.mockRejectedValue({ response: { status: 429 } });
    render(<MemoryRouter><AuthProvider><PlannerPage /></AuthProvider></MemoryRouter>);
    fireEvent.click(screen.getByText('planner.submit'));
    expect(await screen.findByText('planner.errors.rateLimited')).toBeDefined();
  });

  it('usa el mirador elegido en el mapa (?lat=&lon=&place=)', async () => {
    axios.post.mockResolvedValue({ data: { data: { ok: true, visible: false, summary: 'ok', recommendations: [], limitations: [], sources: [] } } });
    render(
      <MemoryRouter initialEntries={['/planner?lat=28.7564&lon=-17.8919&place=Roque%20de%20los%20Muchachos']}>
        <AuthProvider><PlannerPage /></AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('planner.near')).toBeDefined();
    fireEvent.click(screen.getByText('planner.submit'));
    await screen.findByText('ok');
    expect(axios.post.mock.calls[0][1]).toMatchObject({ latitude: 28.7564, longitude: -17.8919 });
  });

  it('guarda el último plan y lo muestra sin conexión', async () => {
    const store = { adastra_session: 't', adastra_user: '{"id":"u1","role":"user"}' };
    window.localStorage.getItem.mockImplementation((k) => store[k] ?? null);
    window.localStorage.setItem.mockImplementation((k, v) => { store[k] = v; });
    const plan = { ok: true, visible: false, summary: 'Plan guardado', recommendations: [], limitations: [], sources: [] };
    axios.post.mockResolvedValueOnce({ data: { data: plan } });
    render(<MemoryRouter><AuthProvider><PlannerPage /></AuthProvider></MemoryRouter>);
    fireEvent.click(screen.getByText('planner.submit'));
    await screen.findByText('Plan guardado');
    expect(JSON.parse(store['adastra.lastPlan']).data.summary).toBe('Plan guardado');

    cleanup();
    axios.post.mockRejectedValueOnce(new Error('Network Error')); // sin cobertura: sin err.response
    render(<MemoryRouter><AuthProvider><PlannerPage /></AuthProvider></MemoryRouter>);
    expect(screen.getByText('Plan guardado')).toBeDefined(); // se ve al abrir la página
    fireEvent.click(screen.getByText('planner.submit'));
    expect(await screen.findByText('planner.errors.generic')).toBeDefined();
    expect(screen.getByText('Plan guardado')).toBeDefined();
    expect(screen.getByText('planner.savedPlan')).toBeDefined();
  });
});
