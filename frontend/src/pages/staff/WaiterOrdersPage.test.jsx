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
  getWaiterServedOrders: vi.fn(),
  markServed: vi.fn(),
}));

describe('WaiterOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderService.getWaiterReadyOrders.mockResolvedValue([
      {
        id: 18,
        tableNumber: 6,
        totalAmount: 120,
        items: [{ quantity: 1, menuItemName: 'Soup' }],
      },
    ]);
    orderService.getWaiterServedOrders.mockResolvedValue([
      {
        id: 19,
        tableNumber: 7,
        totalAmount: 350,
        items: [{ quantity: 2, menuItemName: 'Naan' }],
      },
    ]);
  });

  it('loads ready orders and marks one served', async () => {
    const { toast } = await import('react-toastify');
    orderService.markServed.mockResolvedValue({});

    render(<WaiterOrdersPage />);

    expect(await screen.findByText('#18')).toBeInTheDocument();
    expect(screen.getByText('1x Soup')).toBeInTheDocument();
    expect(screen.getByText('Rs. 120')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mark served' }));

    await waitFor(() => {
      expect(orderService.markServed).toHaveBeenCalledWith(18);
    });
    expect(toast.success).toHaveBeenCalledWith('Order marked served.');
  });

  it('loads served order history without showing served actions', async () => {
    render(<WaiterOrdersPage status="SERVED" />);

    expect(await screen.findByRole('heading', { name: 'Served orders' })).toBeInTheDocument();
    expect(screen.getByText('#19')).toBeInTheDocument();
    expect(screen.getByText('2x Naan')).toBeInTheDocument();
    expect(screen.getByText('Rs. 350')).toBeInTheDocument();
    expect(screen.getByText('Served')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark served' })).not.toBeInTheDocument();
    expect(orderService.getWaiterServedOrders).toHaveBeenCalled();
  });

  it('manually refreshes waiter served history', async () => {
    render(<WaiterOrdersPage status="SERVED" />);

    expect(await screen.findByText('#19')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh orders' }));

    await waitFor(() => {
      expect(orderService.getWaiterServedOrders).toHaveBeenCalledTimes(2);
    });
  });
});
