/* eslint-env node */
import { vi } from 'vitest';

const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => (typeof opts === 'string' ? opts : opts?.defaultValue ?? key),
    i18n: { language: 'es', changeLanguage: vi.fn(), on: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
  default: vi.fn(),
}));

process.env = { ...process.env, VITE_API_URL: 'http://localhost:5000' };
