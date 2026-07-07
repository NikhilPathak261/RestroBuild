import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as orderService from '../../services/orderService';
import WaiterOrdersPage from './WaiterOrdersPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/realtimeService', () => ({
  subscribeToWaiterOrders: vi.fn(() => vi.fn()),
}));

vi.mock('../../services/orderService', () => ({
  getWaiterReadyOrders: vi.fn(),
  markServed: vi.fn(),
}));

describe('WaiterOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderService.getWaiterReadyOrders.mockResolvedValue([
      {
        id: 18,
        tableNumber: 6,
        items: [{ quantity: 1, menuItemName: 'Soup' }],
      },
    ]);
  });

  it('loads ready orders and marks one served', async () => {
    const { toast } = await import('react-toastify');
    orderService.markServed.mockResolvedValue({});

    render(<WaiterOrdersPage />);

    expect(await screen.findByText('#18')).toBeInTheDocument();
    expect(screen.getByText('1x Soup')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mark served' }));

    await waitFor(() => {
      expect(orderService.markServed).toHaveBeenCalledWith(18);
    });
    expect(toast.success).toHaveBeenCalledWith('Order marked served.');
  });
});
