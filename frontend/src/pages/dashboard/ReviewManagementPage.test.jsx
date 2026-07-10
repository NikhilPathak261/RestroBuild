import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as reviewService from '../../services/reviewService';
import ReviewManagementPage from './ReviewManagementPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/reviewService', () => ({
  getReviews: vi.fn(),
  hideReview: vi.fn(),
  showReview: vi.fn(),
  deleteReview: vi.fn(),
}));

describe('ReviewManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reviewService.getReviews.mockResolvedValue([
      {
        id: 10,
        menuItemName: 'Paneer Tikka',
        rating: 5,
        comment: 'Excellent',
        visible: true,
      },
    ]);
  });

  it('filters reviews and hides a visible review', async () => {
    const { toast } = await import('react-toastify');
    reviewService.hideReview.mockResolvedValue({ id: 10, visible: false });

    render(<ReviewManagementPage />);

    expect(await screen.findByText('Paneer Tikka')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '5' } });

    await waitFor(() => {
      expect(reviewService.getReviews).toHaveBeenCalledWith({ rating: '5' });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
    await waitFor(() => {
      expect(reviewService.hideReview).toHaveBeenCalledWith(10);
    });
    expect(toast.success).toHaveBeenCalledWith('Review hidden.');
  });

  it('refreshes reviews with the active rating filter', async () => {
    render(<ReviewManagementPage />);

    expect(await screen.findByText('Paneer Tikka')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '4' } });

    await waitFor(() => {
      expect(reviewService.getReviews).toHaveBeenCalledWith({ rating: '4' });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Refresh reviews' }));

    await waitFor(() => {
      expect(reviewService.getReviews).toHaveBeenLastCalledWith({ rating: '4' });
    });
  });
});
