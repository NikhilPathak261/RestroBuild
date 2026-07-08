import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as tableService from '../../services/tableService';
import TableManagementPage from './TableManagementPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/tableService', () => ({
  createTables: vi.fn(),
  getTables: vi.fn(),
  updateTable: vi.fn(),
  deleteTable: vi.fn(),
  generateQrCodes: vi.fn(),
  regenerateQr: vi.fn(),
}));

const table = {
  id: 5,
  tableNumber: 12,
  qrCodeUrl: 'http://localhost:5173/r/spice-house/menu?tableId=5',
};

describe('TableManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue() },
    });
    tableService.getTables.mockResolvedValue([table]);
  });

  it('creates tables and regenerates QR links', async () => {
    const { toast } = await import('react-toastify');
    tableService.createTables.mockResolvedValue([]);
    tableService.regenerateQr.mockResolvedValue(table);

    render(<TableManagementPage />);

    expect(await screen.findByText('Table 12')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Number of tables'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create tables' }));

    await waitFor(() => {
      expect(tableService.createTables).toHaveBeenCalledWith(3);
    });
    expect(toast.success).toHaveBeenCalledWith('Tables created.');

    fireEvent.click(screen.getByRole('button', { name: 'Regenerate' }));
    await waitFor(() => {
      expect(tableService.regenerateQr).toHaveBeenCalledWith(5);
    });
  });

  it('updates and copies a table QR link', async () => {
    const { toast } = await import('react-toastify');
    tableService.updateTable.mockResolvedValue({ ...table, tableNumber: 14 });

    render(<TableManagementPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Table number'), { target: { value: '14' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save table' }));

    await waitFor(() => {
      expect(tableService.updateTable).toHaveBeenCalledWith(5, 14);
    });
    expect(toast.success).toHaveBeenCalledWith('Table updated.');

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(table.qrCodeUrl);
    });
  });
});
