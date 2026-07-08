import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as staffService from '../../services/staffService';
import StaffManagementPage from './StaffManagementPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/staffService', () => ({
  getStaff: vi.fn(),
  createStaff: vi.fn(),
  updateStaff: vi.fn(),
  enableStaff: vi.fn(),
  disableStaff: vi.fn(),
  deleteStaff: vi.fn(),
}));

describe('StaffManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    staffService.getStaff.mockResolvedValue([
      {
        id: 7,
        name: 'Riya',
        email: 'riya@test.local',
        role: 'KITCHEN',
        active: true,
      },
    ]);
  });

  it('creates a staff account', async () => {
    const { toast } = await import('react-toastify');
    staffService.createStaff.mockResolvedValue({ id: 8 });

    render(<StaffManagementPage />);

    expect(await screen.findByText('Riya')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Aman' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'aman@test.local' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'WAITER' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create staff' }));

    await waitFor(() => {
      expect(staffService.createStaff).toHaveBeenCalledWith({
        name: 'Aman',
        email: 'aman@test.local',
        password: 'password123',
        role: 'WAITER',
      });
    });
    expect(toast.success).toHaveBeenCalledWith('Staff member created.');
  });

  it('edits and disables a staff account', async () => {
    const { toast } = await import('react-toastify');
    staffService.updateStaff.mockResolvedValue({ id: 7 });
    staffService.disableStaff.mockResolvedValue({ id: 7, active: false });

    render(<StaffManagementPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Riya Sharma' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(staffService.updateStaff).toHaveBeenCalledWith(7, {
        name: 'Riya Sharma',
        email: 'riya@test.local',
        role: 'KITCHEN',
      });
    });
    expect(toast.success).toHaveBeenCalledWith('Staff member updated.');

    fireEvent.click(screen.getByRole('button', { name: 'Disable' }));
    await waitFor(() => {
      expect(staffService.disableStaff).toHaveBeenCalledWith(7);
    });
  });
});
