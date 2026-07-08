import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as orderService from '../../services/orderService';
import OrdersPage from './OrdersPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/realtimeService', () => ({
  subscribeToOwnerOrders: vi.fn(() => vi.fn()),
}));

vi.mock('../../services/orderService', () => ({
  getRestaurantOrders: vi.fn(),
  markPreparing: vi.fn(),
  markReady: vi.fn(),
  markServed: vi.fn(),
  cancelOrder: vi.fn(),
}));

const ownerOrder = {
  id: 24,
  tableNumber: 3,
  totalAmount: 450,
  status: 'PENDING',
  items: [{ quantity: 1, menuItemName: 'Biryani' }],
};

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderService.getRestaurantOrders.mockResolvedValue([ownerOrder]);
  });

  it('loads orders by status and marks pending orders preparing', async () => {
    const { toast } = await import('react-toastify');
    orderService.markPreparing.mockResolvedValue({ ...ownerOrder, status: 'PREPARING' });

    render(<OrdersPage />);

    expect(await screen.findByText('#24')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'PENDING' } });

    await waitFor(() => {
      expect(orderService.getRestaurantOrders).toHaveBeenCalledWith('PENDING');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Prepare' }));
    await waitFor(() => {
      expect(orderService.markPreparing).toHaveBeenCalledWith(24);
    });
    expect(toast.success).toHaveBeenCalledWith('Order marked preparing.');
  });
});
