import { render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as analyticsService from '../../services/analyticsService';
import * as orderService from '../../services/orderService';
import DashboardPage from './DashboardPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('../../services/analyticsService', () => ({
  getSummary: vi.fn(),
  getTopMenuItems: vi.fn(),
}));

vi.mock('../../services/orderService', () => ({
  getRestaurantOrders: vi.fn(),
}));

vi.mock('../../services/realtimeService', () => ({
  subscribeToOwnerOrders: vi.fn(() => vi.fn()),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    analyticsService.getSummary.mockResolvedValue({
      todayOrders: 7,
      todayRevenue: 3200,
      averageRating: 4.5,
    });
    analyticsService.getTopMenuItems.mockResolvedValue([{ menuItemName: 'Paneer Tikka', quantity: 12 }]);
    orderService.getRestaurantOrders.mockResolvedValue([
      { id: 42, tableNumber: 5, totalAmount: 850, status: 'READY' },
    ]);
  });

  it('loads dashboard metrics and recent orders', async () => {
    render(<DashboardPage />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Business overview' })).toBeInTheDocument();

    expect(within(screen.getByText("Today's Orders").closest('article')).getByText('7')).toBeInTheDocument();
    expect(within(screen.getByText("Today's Revenue").closest('article')).getByText('Rs. 3200')).toBeInTheDocument();
    expect(within(screen.getByText('Average Rating').closest('article')).getByText('4.5')).toBeInTheDocument();
    expect(within(screen.getByText('Popular Dish').closest('article')).getByText('Paneer Tikka')).toBeInTheDocument();

    expect(screen.getByText('#42')).toBeInTheDocument();
    expect(screen.getByText('READY')).toBeInTheDocument();
    await waitFor(() => expect(orderService.getRestaurantOrders).toHaveBeenCalledWith());
  });
});
