import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute';

function renderProtectedRoute({ initialPath = '/dashboard', allowedRoles = ['ROLE_OWNER'] } = {}) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
            <Route path="/dashboard" element={<div>Owner dashboard</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('redirects unauthenticated users to login', () => {
    renderProtectedRoute();

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('redirects authenticated users without an allowed role', () => {
    localStorage.setItem(STORAGE_KEYS.accessToken, 'token');
    localStorage.setItem(STORAGE_KEYS.role, 'ROLE_WAITER');

    renderProtectedRoute();

    expect(screen.getByText('Unauthorized page')).toBeInTheDocument();
  });

  it('renders nested routes for authenticated users with an allowed role', () => {
    localStorage.setItem(STORAGE_KEYS.accessToken, 'token');
    localStorage.setItem(STORAGE_KEYS.role, 'ROLE_OWNER');

    renderProtectedRoute();

    expect(screen.getByText('Owner dashboard')).toBeInTheDocument();
  });
});
