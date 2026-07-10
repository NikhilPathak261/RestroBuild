import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as orderService from '../../services/orderService';
import PublicBillPage from './PublicBillPage';

vi.mock('../../services/orderService', () => ({
  getOrder: vi.fn(),
}));

vi.mock('../../services/realtimeService', () => ({
  subscribeToOrder: vi.fn(() => vi.fn()),
}));

describe('PublicBillPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  it('renders bill line items and totals', async () => {
    render(
      <MemoryRouter initialEntries={['/r/cafe/bill/55?tableId=4']}>
        <Routes>
          <Route path="/r/:restaurantSlug/bill/:orderId" element={<PublicBillPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Order #55' })).toBeInTheDocument();
    expect(screen.getByText('Paneer Tikka')).toBeInTheDocument();
    expect(screen.getByText('Lassi')).toBeInTheDocument();
    expect(screen.getByText('Instructions: Serve together')).toBeInTheDocument();
    expect(screen.getAllByText('Rs. 700')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Back to order status' })).toHaveAttribute('href', '/r/cafe/orders/55?tableId=4');
  });
});
