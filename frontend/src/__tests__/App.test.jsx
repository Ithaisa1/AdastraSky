import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import HomePage from '../pages/HomePage';

describe('HomePage', () => {
  it('renderiza el logo Adastra Sky', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <HomePage />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('ADASTRA')).toBeDefined();
  });
});
