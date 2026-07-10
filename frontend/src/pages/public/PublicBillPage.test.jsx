import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as orderService from '../../services/orderService';
import PublicBillPage from './PublicBillPage';

vi.mock('../../services/orderService', () => ({
  getOrder: vi.fn(),
  getOrderStatus: vi.fn(),
  getTableBill: vi.fn(),
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
    orderService.getTableBill.mockResolvedValue({
      tableId: 4,
      tableNumber: 4,
      orderCount: 2,
      itemCount: 4,
      subtotal: 900,
      totalAmount: 900,
      items: [
        { orderId: 55, orderStatus: 'SERVED', orderItemId: 1, menuItemName: 'Paneer Tikka', quantity: 2, price: 250, subtotal: 500 },
        { orderId: 55, orderStatus: 'SERVED', orderItemId: 2, menuItemName: 'Lassi', quantity: 1, price: 200, subtotal: 200 },
        { orderId: 56, orderStatus: 'SERVED', orderItemId: 3, menuItemName: 'Dal', quantity: 1, price: 200, subtotal: 200 },
      ],
    });
  });

  it('renders table bill line items and totals', async () => {
    renderBill();

    expect(await screen.findByRole('heading', { name: 'Table 4 bill' })).toBeInTheDocument();
    expect(screen.getByText('2 orders in this table bill')).toBeInTheDocument();
    expect(screen.getByText('served')).toBeInTheDocument();
    expect(screen.getByText('Ready for final payment with restaurant staff.')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Paneer Tikka')).toBeInTheDocument();
    expect(screen.getByText('Lassi')).toBeInTheDocument();
    expect(screen.getByText('Dal')).toBeInTheDocument();
    expect(screen.getByText('Instructions: Serve together')).toBeInTheDocument();
    expect(screen.getAllByText('Rs. 900')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Back to order status' })).toHaveAttribute('href', '/r/cafe/orders/55?tableId=4');
    expect(screen.queryByRole('link', { name: 'Add more items' })).not.toBeInTheDocument();
    expect(orderService.getTableBill).toHaveBeenCalledWith('4');
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

  it('falls back to the direct order bill when table aggregation is empty', async () => {
    orderService.getTableBill.mockResolvedValue({
      tableId: 4,
      tableNumber: 4,
      orderCount: 0,
      itemCount: 0,
      subtotal: 0,
      totalAmount: 0,
      items: [],
    });

    renderBill();

    expect(await screen.findByRole('heading', { name: 'Order #55' })).toBeInTheDocument();
    expect(screen.getByText('Table 4 - served')).toBeInTheDocument();
    expect(screen.getAllByText('Rs. 700')).toHaveLength(2);
  });

  it('manually refreshes the bill summary', async () => {
    renderBill();

    expect(await screen.findByRole('heading', { name: 'Table 4 bill' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh bill' }));

    await waitFor(() => {
      expect(orderService.getOrder).toHaveBeenCalledTimes(2);
      expect(orderService.getOrderStatus).toHaveBeenCalledTimes(2);
      expect(orderService.getTableBill).toHaveBeenCalledTimes(2);
    });
  });
});
