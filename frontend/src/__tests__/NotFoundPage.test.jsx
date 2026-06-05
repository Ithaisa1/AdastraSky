import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import NotFoundPage from '../pages/NotFoundPage';

describe('NotFoundPage', () => {
  it('renderiza el mensaje 404', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <NotFoundPage />
        </AuthProvider>
      </BrowserRouter>
    );
    expect(screen.getByText('404')).toBeDefined();
    expect(screen.getByText(/volver/i)).toBeDefined();
  });
});
