import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import AuthContext from '../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import StaffLayout from './StaffLayout';

const authValue = {
  isAuthenticated: true,
  role: 'owner',
  signIn: () => {},
  signOut: () => {},
};

function renderWithAuth(ui, initialEntry) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialEntry]}>
        {ui}
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('dashboard layout accessibility', () => {
  it('adds a skip link and main landmark to the owner dashboard shell', () => {
    renderWithAuth(
      <Routes>
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<h1>Owner dashboard</h1>} />
        </Route>
      </Routes>,
      '/dashboard',
    );

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('heading', { name: 'Owner dashboard' })).toBeInTheDocument();
  });

  it('adds a skip link and main landmark to staff shells', () => {
    renderWithAuth(
      <Routes>
        <Route path="/kitchen/pending" element={<StaffLayout role="kitchen" />}>
          <Route index element={<h1>Pending kitchen orders</h1>} />
        </Route>
      </Routes>,
      '/kitchen/pending',
    );

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('heading', { name: 'Pending kitchen orders' })).toBeInTheDocument();
  });
});
