import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as orderService from '../../services/orderService';
import { getPublicCartKey } from '../../utils/publicCart';
import PublicCartPage from './PublicCartPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/orderService', () => ({
  placeOrder: vi.fn(),
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderCart(path = '/r/pizza-palace/cart?tableId=7') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/r/:restaurantSlug/cart" element={<PublicCartPage />} />
        <Route path="/r/:restaurantSlug/menu" element={<LocationProbe />} />
        <Route path="/r/:restaurantSlug/orders/:orderId" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicCartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem(
      getPublicCartKey('pizza-palace', '7'),
      JSON.stringify({
        items: [{ id: 12, name: 'Chicken Pepperoni', price: 399, quantity: 2 }],
        specialInstructions: 'Less spicy',
      }),
    );
  });

  it('loads persisted cart items and updates quantities', async () => {
    renderCart();

    expect(await screen.findByRole('heading', { name: 'Your order' })).toBeInTheDocument();
    expect(screen.getByText('Chicken Pepperoni')).toBeInTheDocument();
    expect(screen.getByText('Rs. 798')).toBeInTheDocument();
    expect(screen.getByLabelText('Special instructions')).toHaveValue('Less spicy');

    fireEvent.click(screen.getByRole('button', { name: 'Remove one Chicken Pepperoni' }));

    expect(screen.getByText('Rs. 399')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(getPublicCartKey('pizza-palace', '7'))).items[0].quantity).toBe(1);
  });

  it('clears persisted cart items and instructions', async () => {
    renderCart();

    expect(await screen.findByText('Chicken Pepperoni')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear cart' }));

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.getByLabelText('Special instructions')).toHaveValue('');
    expect(window.localStorage.getItem(getPublicCartKey('pizza-palace', '7'))).toBeNull();
  });

  it('places persisted cart orders and clears storage', async () => {
    const { toast } = await import('react-toastify');
    orderService.placeOrder.mockResolvedValue({ id: 99 });

    renderCart();

    fireEvent.click(await screen.findByRole('button', { name: 'Place order' }));

    await waitFor(() => {
      expect(orderService.placeOrder).toHaveBeenCalledWith({
        tableId: 7,
        items: [{ menuItemId: 12, quantity: 2 }],
        specialInstructions: 'Less spicy',
      });
    });
    expect(toast.success).toHaveBeenCalledWith('Order placed.');
    expect(window.localStorage.getItem(getPublicCartKey('pizza-palace', '7'))).toBeNull();
    expect(await screen.findByTestId('location')).toHaveTextContent('/r/pizza-palace/orders/99?tableId=7');
  });

  it('requires a table QR before placing orders', async () => {
    const { toast } = await import('react-toastify');
    window.localStorage.setItem(
      getPublicCartKey('pizza-palace', null),
      JSON.stringify({ items: [{ id: 12, name: 'Chicken Pepperoni', price: 399, quantity: 1 }], specialInstructions: '' }),
    );

    renderCart('/r/pizza-palace/cart');

    fireEvent.click(await screen.findByRole('button', { name: 'Place order' }));

    expect(toast.error).toHaveBeenCalledWith('Please scan the table QR code before ordering.');
    expect(orderService.placeOrder).not.toHaveBeenCalled();
  });
});
