import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../hooks/useAuth';
import LoginPage from './LoginPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<div>Owner dashboard</div>} />
        <Route path="/kitchen/pending" element={<div>Kitchen pending</div>} />
        <Route path="/waiter/ready" element={<div>Waiter ready</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      signIn: vi.fn().mockResolvedValue({ role: 'ROLE_OWNER' }),
    });
  });

  it('fills demo credentials from quick actions', () => {
    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: 'Kitchen demo' }));

    expect(screen.getByLabelText('Email')).toHaveValue('kitchen@demo.restrobuild.test');
    expect(screen.getByLabelText('Password')).toHaveValue('DemoPass123');
  });

  it('routes demo staff users after login', async () => {
    const signIn = vi.fn().mockResolvedValue({ role: 'ROLE_WAITER' });
    useAuth.mockReturnValue({ signIn });

    renderLogin();

    fireEvent.click(screen.getByRole('button', { name: 'Waiter demo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith({
        email: 'waiter@demo.restrobuild.test',
        password: 'DemoPass123',
      });
    });
    expect(await screen.findByText('Waiter ready')).toBeInTheDocument();
  });
});
