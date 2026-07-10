import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as orderService from '../../services/orderService';
import PublicBillPage from './PublicBillPage';

vi.mock('../../services/orderService', () => ({
  getOrder: vi.fn(),
  getOrderStatus: vi.fn(),
}));

vi.mock('../../services/realtimeService', () => ({
  subscribeToOrder: vi.fn(() => vi.fn()),
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderBill(path = '/r/cafe/bill/55?tableId=4') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/r/:restaurantSlug/bill/:orderId" element={<PublicBillPage />} />
        <Route path="/r/:restaurantSlug/orders/:orderId" element={<LocationProbe />} />
        <Route path="/r/:restaurantSlug/menu" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicBillPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'print').mockImplementation(() => {});
    orderService.getOrder.mockResolvedValue({
      id: 55,
      tableNumber: 4,
      status: 'SERVED',
      totalAmount: 700,
      specialInstructions: 'Serve together',
      items: [
        { id: 1, menuItemName: 'Paneer Tikka', quantity: 2, price: 250, subtotal: 500 },
        { id: 2, menuItemName: 'Lassi', quantity: 1, price: 200, subtotal: 200 },
      ],
    });
    orderService.getOrderStatus.mockResolvedValue({
      orderId: 55,
      status: 'SERVED',
      estimatedTime: 0,
    });
  });

  it('renders bill line items and totals', async () => {
    renderBill();

    expect(await screen.findByRole('heading', { name: 'Order #55' })).toBeInTheDocument();
    expect(screen.getByText('Table 4 - served')).toBeInTheDocument();
    expect(screen.getByText('served')).toBeInTheDocument();
    expect(screen.getByText('Ready for final payment with restaurant staff.')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Paneer Tikka')).toBeInTheDocument();
    expect(screen.getByText('Lassi')).toBeInTheDocument();
    expect(screen.getByText('Instructions: Serve together')).toBeInTheDocument();
    expect(screen.getAllByText('Rs. 700')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Back to order status' })).toHaveAttribute('href', '/r/cafe/orders/55?tableId=4');
    expect(screen.queryByRole('link', { name: 'Add more items' })).not.toBeInTheDocument();
  });

  it('supports active bill refresh context and print actions', async () => {
    orderService.getOrderStatus.mockResolvedValue({
      orderId: 55,
      status: 'PREPARING',
      estimatedTime: 15,
    });

    renderBill();

    expect(await screen.findByText('This bill may update until the order is served.')).toBeInTheDocument();
    expect(screen.getByText('15 min')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add more items' })).toHaveAttribute('href', '/r/cafe/menu?tableId=4');

    fireEvent.click(screen.getByRole('button', { name: 'Print bill' }));

    expect(window.print).toHaveBeenCalled();
  });
});
