/**
 * Renderiza cada página con un usuario autenticado y la red simulada.
 * Detecta errores en tiempo de ejecución (variables no definidas, imports rotos)
 * que la compilación no encuentra.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

vi.mock('axios', () => {
  const ok = () => Promise.resolve({ data: { status: 'success', data: { zones: [], users: [], experiences: [], sessions: [], history: [], score: null } } });
  const axios = { get: vi.fn(ok), post: vi.fn(ok), put: vi.fn(ok), delete: vi.fn(ok), defaults: { headers: { common: {} } } };
  return { default: axios, ...axios };
});

const pages = {
  HomePage: () => import('../pages/HomePage'),
  LoginPage: () => import('../pages/LoginPage'),
  DashboardPage: () => import('../pages/DashboardPage'),
  ChatPage: () => import('../pages/ChatPage'),
  PlannerPage: () => import('../pages/PlannerPage'),
  ProfilePage: () => import('../pages/ProfilePage'),
  ObservatoriesPage: () => import('../pages/ObservatoriesPage'),
  DataPage: () => import('../pages/DataPage'),
  CalendarPage: () => import('../pages/CalendarPage'),
  ContactPage: () => import('../pages/ContactPage'),
  FAQPage: () => import('../pages/FAQPage'),
  ExperiencesPage: () => import('../pages/ExperiencesPage'),
  AdminPanel: () => import('../pages/AdminPanel'),
  NotFoundPage: () => import('../pages/NotFoundPage'),
  ExploradorPage: () => import('../pages/ExploradorPage'),
};

beforeEach(() => {
  cleanup();
  const user = { id: 'u1', email: 'test@adastra.test', first_name: 'Test', last_name: 'User', role: 'admin' };
  window.localStorage.getItem.mockImplementation((k) => ({ adastra_session: 'token', adastra_user: JSON.stringify(user) }[k] ?? null));
  globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true, status: 'success', data: [] }), blob: () => Promise.resolve(new Blob()) }));
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('Todas las páginas se renderizan sin errores', () => {
  for (const [name, load] of Object.entries(pages)) {
    it(name, async () => {
      const { default: Page } = await load();
      const errors = [];
      const spy = vi.spyOn(console, 'error').mockImplementation((...a) => errors.push(a.join(' ')));
      render(<MemoryRouter><AuthProvider><Page /></AuthProvider></MemoryRouter>);
      await new Promise((r) => setTimeout(r, 0));
      spy.mockRestore();
      expect(document.body.textContent.length).toBeGreaterThan(0);
      expect(errors.filter((e) => /is not defined|Cannot read|not a function|Objects are not valid/.test(e))).toEqual([]);
      expect(screen.queryAllByText(/undefined/).length).toBe(0);
    });
  }
});
