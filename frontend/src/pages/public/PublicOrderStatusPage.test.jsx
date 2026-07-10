import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as orderService from '../../services/orderService';
import * as reviewService from '../../services/reviewService';
import PublicOrderStatusPage from './PublicOrderStatusPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/orderService', () => ({
  getOrder: vi.fn(),
}));

vi.mock('../../services/reviewService', () => ({
  submitReview: vi.fn(),
}));

vi.mock('../../services/realtimeService', () => ({
  subscribeToOrder: vi.fn(() => vi.fn()),
}));

const activeOrder = {
  id: 55,
  tableNumber: 4,
  status: 'READY',
  totalAmount: 650,
  specialInstructions: 'No onion',
  items: [
    { id: 1, menuItemName: 'Paneer Tikka', quantity: 2, subtotal: 650 },
  ],
};

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderOrderStatus(path = '/r/cafe/orders/55?tableId=4') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/r/:restaurantSlug/orders/:orderId" element={<PublicOrderStatusPage />} />
        <Route path="/r/:restaurantSlug/menu" element={<LocationProbe />} />
        <Route path="/r/:restaurantSlug/bill/:orderId" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicOrderStatusPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderService.getOrder.mockResolvedValue(activeOrder);
  });

  it('shows order details with add-more and bill actions', async () => {
    renderOrderStatus();

    expect(await screen.findByRole('heading', { name: 'READY' })).toBeInTheDocument();
    expect(screen.getByText('Paneer Tikka')).toBeInTheDocument();
    expect(screen.getByText('Instructions: No onion')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Add more items' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/r/cafe/menu?tableId=4');
  });

  it('submits reviews once the order is served', async () => {
    const { toast } = await import('react-toastify');
    orderService.getOrder.mockResolvedValue({ ...activeOrder, status: 'SERVED' });
    reviewService.submitReview.mockResolvedValue({});
    renderOrderStatus();

    expect(await screen.findByRole('heading', { name: 'SERVED' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Comment'), { target: { value: 'Great dish' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit review' }));

    await waitFor(() => {
      expect(reviewService.submitReview).toHaveBeenCalledWith({
        orderItemId: 1,
        rating: 5,
        comment: 'Great dish',
      });
    });
    expect(toast.success).toHaveBeenCalledWith('Review submitted.');
  });
});
