import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authService from '../../services/authService';
import RegisterPage from './RegisterPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/authService', () => ({
  registerOwner: vi.fn(),
}));

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers owner accounts and redirects to login', async () => {
    const { toast } = await import('react-toastify');
    authService.registerOwner.mockResolvedValue(null);

    renderRegister();

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Owner User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@test.local' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(authService.registerOwner).toHaveBeenCalledWith({
        name: 'Owner User',
        email: 'owner@test.local',
        password: 'Password123',
      });
    });
    expect(toast.success).toHaveBeenCalledWith('Registration successful. Please login.');
    expect(await screen.findByText('Login page')).toBeInTheDocument();
  });
});
