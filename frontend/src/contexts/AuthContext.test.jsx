import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/authService';
import { AuthProvider } from './AuthContext.jsx';

vi.mock('../services/authService', () => ({
  login: vi.fn(),
}));

function SignInProbe() {
  const { role, signIn } = useAuth();

  async function handleClick() {
    await signIn({ email: 'owner@test.local', password: 'Password123' });
  }

  return (
    <div>
      <button type="button" onClick={handleClick}>Sign in</button>
      <span>{role || 'No role'}</span>
    </div>
  );
}

describe('AuthProvider', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('stores unwrapped login responses', async () => {
    authService.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      role: 'ROLE_OWNER',
    });

    render(
      <AuthProvider>
        <SignInProbe />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('ROLE_OWNER')).toBeInTheDocument();
    });
    expect(localStorage.getItem(STORAGE_KEYS.accessToken)).toBe('access-token');
    expect(localStorage.getItem(STORAGE_KEYS.refreshToken)).toBe('refresh-token');
    expect(localStorage.getItem(STORAGE_KEYS.role)).toBe('ROLE_OWNER');
  });
});
