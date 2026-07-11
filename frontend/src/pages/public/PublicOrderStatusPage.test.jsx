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
  getOrderStatus: vi.fn(),
  getOrderTimeline: vi.fn(),
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
    { id: 1, menuItemName: 'Paneer Tikka', quantity: 2, subtotal: 650, reviewed: false },
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
    orderService.getOrderStatus.mockResolvedValue({
      orderId: 55,
      status: 'READY',
      estimatedTime: 18,
    });
    orderService.getOrderTimeline.mockResolvedValue([
      {
        status: 'PENDING',
        label: 'Placed',
        description: 'The kitchen has received your order.',
        state: 'completed',
        timestamp: '2026-07-10T10:00:00Z',
      },
      {
        status: 'PREPARING',
        label: 'Preparing',
        description: 'Your food is being prepared.',
        state: 'completed',
        timestamp: null,
      },
      {
        status: 'READY',
        label: 'Ready',
        description: 'Your order is ready for service.',
        state: 'current',
        timestamp: '2026-07-10T10:15:00Z',
      },
      {
        status: 'SERVED',
        label: 'Served',
        description: 'Your order has been served.',
        state: 'upcoming',
        timestamp: null,
      },
    ]);
  });

  it('shows order details with add-more and bill actions', async () => {
    renderOrderStatus();

    expect(await screen.findByRole('heading', { name: 'ready' })).toBeInTheDocument();
    expect(screen.getByText('Almost there')).toBeInTheDocument();
    expect(screen.getByText('18 min')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Order progress' })).toHaveTextContent('Placed');
    expect(screen.getByRole('list', { name: 'Order progress' })).toHaveTextContent('Preparing');
    expect(screen.getByRole('list', { name: 'Order progress' })).toHaveTextContent('Ready');
    expect(screen.getByRole('list', { name: 'Order progress' })).toHaveTextContent('Served');
    expect(screen.getByText('Paneer Tikka')).toBeInTheDocument();
    expect(screen.getByText('Instructions: No onion')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Add more items' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/r/cafe/menu?tableId=4');
  });

  it('manually refreshes order status', async () => {
    renderOrderStatus();

    expect(await screen.findByRole('heading', { name: 'ready' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh order' }));

    await waitFor(() => {
      expect(orderService.getOrder).toHaveBeenCalledTimes(2);
      expect(orderService.getOrderStatus).toHaveBeenCalledTimes(2);
      expect(orderService.getOrderTimeline).toHaveBeenCalledTimes(2);
    });
  });

  it('submits reviews once the order is served', async () => {
    const { toast } = await import('react-toastify');
    orderService.getOrder.mockResolvedValue({ ...activeOrder, status: 'SERVED' });
    orderService.getOrderStatus.mockResolvedValue({
      orderId: 55,
      status: 'SERVED',
      estimatedTime: 18,
    });
    orderService.getOrderTimeline.mockResolvedValue([
      {
        status: 'PENDING',
        label: 'Placed',
        description: 'The kitchen has received your order.',
        state: 'completed',
        timestamp: '2026-07-10T10:00:00Z',
      },
      {
        status: 'PREPARING',
        label: 'Preparing',
        description: 'Your food is being prepared.',
        state: 'completed',
        timestamp: null,
      },
      {
        status: 'READY',
        label: 'Ready',
        description: 'Your order is ready for service.',
        state: 'completed',
        timestamp: null,
      },
      {
        status: 'SERVED',
        label: 'Served',
        description: 'Your order has been served.',
        state: 'current',
        timestamp: '2026-07-10T10:25:00Z',
      },
    ]);
    reviewService.submitReview.mockResolvedValue({});
    renderOrderStatus();

    expect(await screen.findByRole('heading', { name: 'served' })).toBeInTheDocument();
    expect(screen.getByText('Enjoy your meal')).toBeInTheDocument();
    expect(screen.getAllByText('Served')).toHaveLength(2);
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
    expect(await screen.findByText('Review submitted. Thank you.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submitted' })).toBeDisabled();
  });

  it('shows already-reviewed served items as submitted', async () => {
    orderService.getOrder.mockResolvedValue({
      ...activeOrder,
      status: 'SERVED',
      items: [
        { id: 1, menuItemName: 'Paneer Tikka', quantity: 2, subtotal: 650, reviewed: true },
      ],
    });
    orderService.getOrderStatus.mockResolvedValue({
      orderId: 55,
      status: 'SERVED',
      estimatedTime: 18,
    });

    renderOrderStatus();

    expect(await screen.findByText('Review submitted. Thank you.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submitted' })).toBeDisabled();
  });
});
