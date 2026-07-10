import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as analyticsService from '../../services/analyticsService';
import AnalyticsPage from './AnalyticsPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('../../services/analyticsService', () => ({
  getSummary: vi.fn(),
  getDailyRevenue: vi.fn(),
  getTopMenuItems: vi.fn(),
  getBottomMenuItems: vi.fn(),
  getCategoryStats: vi.fn(),
  getRatingsSummary: vi.fn(),
}));

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    analyticsService.getSummary.mockResolvedValue({
      totalOrders: 24,
      todayOrders: 5,
      totalRevenue: 12500,
      averageRating: 4.6,
    });
    analyticsService.getDailyRevenue.mockResolvedValue([{ label: 'Jul 08', revenue: 2500 }]);
    analyticsService.getTopMenuItems.mockResolvedValue([{ menuItemName: 'Biryani', quantity: 12 }]);
    analyticsService.getBottomMenuItems.mockResolvedValue([]);
    analyticsService.getCategoryStats.mockResolvedValue([{ categoryName: 'Mains', quantity: 20 }]);
    analyticsService.getRatingsSummary.mockResolvedValue({
      ratingDistribution: {
        5: 8,
        4: 3,
      },
    });
  });

  it('renders analytics metrics, lists, and empty states', async () => {
    render(<AnalyticsPage />);

    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Business performance' })).toBeInTheDocument();

    expect(within(screen.getByText('Total Orders').closest('article')).getByText('24')).toBeInTheDocument();
    expect(within(screen.getByText("Today's Orders").closest('article')).getByText('5')).toBeInTheDocument();
    expect(within(screen.getByText('Total Revenue').closest('article')).getByText('Rs. 12500')).toBeInTheDocument();
    expect(within(screen.getByText('Average Rating').closest('article')).getByText('4.6')).toBeInTheDocument();

    expect(screen.getByText('Jul 08')).toBeInTheDocument();
    expect(screen.getByText('Rs. 2500')).toBeInTheDocument();
    expect(screen.getByText('Biryani')).toBeInTheDocument();
    expect(screen.getByText('Mains')).toBeInTheDocument();
    expect(screen.getByText('No data yet.')).toBeInTheDocument();
    expect(screen.getByText('5 star')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('manually refreshes analytics data', async () => {
    render(<AnalyticsPage />);

    expect(await screen.findByRole('heading', { name: 'Business performance' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh analytics' }));

    await waitFor(() => {
      expect(analyticsService.getSummary).toHaveBeenCalledTimes(2);
      expect(analyticsService.getRatingsSummary).toHaveBeenCalledTimes(2);
    });
  });
});
