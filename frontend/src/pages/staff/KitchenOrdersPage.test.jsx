import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as orderService from '../../services/orderService';
import KitchenOrdersPage from './KitchenOrdersPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/realtimeService', () => ({
  subscribeToKitchenOrders: vi.fn(() => vi.fn()),
}));

vi.mock('../../services/orderService', () => ({
  getKitchenPendingOrders: vi.fn(),
  getKitchenPreparingOrders: vi.fn(),
  getKitchenReadyOrders: vi.fn(),
  markPreparing: vi.fn(),
  markReady: vi.fn(),
}));

const kitchenOrder = {
  id: 12,
  tableNumber: 4,
  items: [{ quantity: 2, menuItemName: 'Pasta' }],
};

describe('KitchenOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderService.getKitchenPendingOrders.mockResolvedValue([kitchenOrder]);
    orderService.getKitchenPreparingOrders.mockResolvedValue([kitchenOrder]);
    orderService.getKitchenReadyOrders.mockResolvedValue([]);
  });

  it('loads pending orders and marks an order preparing', async () => {
    const { toast } = await import('react-toastify');
    orderService.markPreparing.mockResolvedValue({});

    render(<KitchenOrdersPage status="PENDING" />);

    expect(await screen.findByText('#12')).toBeInTheDocument();
    expect(screen.getByText('2x Pasta')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Prepare' }));

    await waitFor(() => {
      expect(orderService.markPreparing).toHaveBeenCalledWith(12);
    });
    expect(toast.success).toHaveBeenCalledWith('Order marked preparing.');
  });

  it('loads preparing orders and marks an order ready', async () => {
    const { toast } = await import('react-toastify');
    orderService.markReady.mockResolvedValue({});

    render(<KitchenOrdersPage status="PREPARING" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Ready' }));

    await waitFor(() => {
      expect(orderService.markReady).toHaveBeenCalledWith(12);
    });
    expect(toast.success).toHaveBeenCalledWith('Order marked ready.');
  });
});
