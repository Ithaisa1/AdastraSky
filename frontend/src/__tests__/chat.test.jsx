import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider } from '../context/AuthContext';
import ChatPage, { errorKeyFor } from '../pages/ChatPage';

vi.mock('axios', () => {
  const axios = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), defaults: { headers: { common: {} } } };
  return { default: axios, ...axios };
});

const SID = '11111111-1111-4111-8111-111111111111';
const store = {};

const renderChat = () => render(<MemoryRouter><AuthProvider><ChatPage /></AuthProvider></MemoryRouter>);

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  for (const k of Object.keys(store)) delete store[k];
  store.adastra_session = 'token';
  store.adastra_user = JSON.stringify({ id: 'u1', email: 'a@adastra.test', role: 'user' });
  window.localStorage.getItem.mockImplementation((k) => store[k] ?? null);
  window.localStorage.setItem.mockImplementation((k, v) => { store[k] = String(v); });
  window.localStorage.removeItem.mockImplementation((k) => { delete store[k]; });
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true }));
  axios.get.mockResolvedValue({ data: { data: { history: [], sessions: [] } } });
});

describe('ChatPage', () => {
  it('envía con el botón, reutiliza el session_id y muestra las fuentes', async () => {
    axios.post
      .mockResolvedValueOnce({ data: { data: { response: 'El Roque es excelente.', session_id: SID, sources: [{ title: 'Observatorio del Roque de los Muchachos (ORM)', section: 'Visitas' }] } } })
      .mockResolvedValueOnce({ data: { data: { response: 'Desde el Teide también.', session_id: SID, sources: [] } } });
    renderChat();

    const input = screen.getByLabelText('chat.placeholder');
    fireEvent.change(input, { target: { value: '¿Cómo es el cielo del Roque?' } });
    fireEvent.click(screen.getByRole('button', { name: /chat.send/ }));

    expect(await screen.findByText('El Roque es excelente.')).toBeDefined();
    expect(screen.getByText('¿Cómo es el cielo del Roque?')).toBeDefined(); // el mensaje del usuario aparece
    expect(input.value).toBe(''); // y el campo se vacía (antes fallaba con el botón)
    expect(screen.getByText(/Observatorio del Roque de los Muchachos \(ORM\)/)).toBeDefined();
    expect(axios.post.mock.calls[0][1].session_id).toBeUndefined();
    expect(store['adastra.chat.session.u1']).toBe(SID);

    fireEvent.change(input, { target: { value: '¿Y desde el Teide?' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await screen.findByText('Desde el Teide también.');
    expect(axios.post.mock.calls[1][1]).toMatchObject({ message: '¿Y desde el Teide?', session_id: SID, language: 'es' });
  });

  it('recupera la conversación guardada al volver a entrar', async () => {
    store['adastra.chat.session.u1'] = SID;
    axios.get.mockResolvedValueOnce({ data: { data: { history: [{ message: 'Hola', response: '¡Hola! Soy AdAstra', sources: [] }] } } });
    renderChat();
    expect(await screen.findByText('¡Hola! Soy AdAstra')).toBeDefined();
    expect(axios.get.mock.calls[0][0]).toContain(`/api/chat/history/${SID}`);
  });

  it('«Nueva conversación» olvida la sesión', async () => {
    store['adastra.chat.session.u1'] = SID;
    axios.get.mockResolvedValueOnce({ data: { data: { history: [{ message: 'Hola', response: 'Hola', sources: [] }] } } });
    renderChat();
    await screen.findAllByText('Hola');
    fireEvent.click(screen.getAllByText('chat.newConversation')[0].closest('button'));
    expect(store['adastra.chat.session.u1']).toBeUndefined();
    await waitFor(() => expect(screen.queryAllByText('Hola').length).toBe(0));
  });

  it('traduce los errores por código', () => {
    expect(errorKeyFor({ response: { status: 429 } })).toBe('chat.errors.busy');
    expect(errorKeyFor({ response: { status: 503, data: { code: 'AI_SERVICE_UNAVAILABLE' } } })).toBe('chat.errors.starting');
    expect(errorKeyFor({ response: { status: 401 } })).toBe('chat.errors.session');
    expect(errorKeyFor({})).toBe('chat.errors.generic');
  });
});
