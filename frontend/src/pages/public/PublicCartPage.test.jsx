import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as cartService from '../../services/cartService';
import * as orderService from '../../services/orderService';
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

vi.mock('../../services/cartService', () => ({
  getCart: vi.fn(),
  addCartItem: vi.fn(),
  updateCartItem: vi.fn(),
  removeCartItem: vi.fn(),
  clearCart: vi.fn(),
}));

const pepperoniCart = {
  cartToken: 'cart-token-1',
  items: [
    {
      id: 101,
      menuItemId: 12,
      menuItemName: 'Chicken Pepperoni',
      price: 399,
      quantity: 2,
      subtotal: 798,
      specialInstructions: 'Less spicy',
    },
  ],
  subtotal: 798,
};

const singlePepperoniCart = {
  ...pepperoniCart,
  items: [
    {
      ...pepperoniCart.items[0],
      quantity: 1,
      subtotal: 399,
    },
  ],
  subtotal: 399,
};

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
    cartService.getCart.mockResolvedValue(pepperoniCart);
    cartService.updateCartItem.mockResolvedValue(singlePepperoniCart);
    cartService.clearCart.mockResolvedValue();
  });

  it('loads server cart items and updates quantities', async () => {
    renderCart();

    expect(await screen.findByRole('heading', { name: 'Your order' })).toBeInTheDocument();
    expect(screen.getByText('Chicken Pepperoni')).toBeInTheDocument();
    expect(screen.getByText('Rs. 798')).toBeInTheDocument();
    expect(screen.getByLabelText('Special instructions')).toHaveValue('Less spicy');

    fireEvent.click(screen.getByRole('button', { name: 'Remove one Chicken Pepperoni' }));

    await waitFor(() => {
      expect(cartService.updateCartItem).toHaveBeenCalledWith(101, {
        quantity: 1,
        specialInstructions: 'Less spicy',
      });
    });
    expect(await screen.findByText('Rs. 399')).toBeInTheDocument();
  });

  it('clears server cart items and instructions', async () => {
    renderCart();

    expect(await screen.findByText('Chicken Pepperoni')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear cart' }));

    await waitFor(() => {
      expect(cartService.clearCart).toHaveBeenCalled();
    });
    expect(await screen.findByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.getByLabelText('Special instructions')).toHaveValue('');
  });

  it('places server cart orders and clears the backend cart', async () => {
    const { toast } = await import('react-toastify');
    orderService.placeOrder.mockResolvedValue({ id: 99 });
    cartService.updateCartItem.mockResolvedValue({
      ...pepperoniCart,
      items: [{ ...pepperoniCart.items[0], specialInstructions: 'Less spicy' }],
    });

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
    expect(cartService.clearCart).toHaveBeenCalled();
    expect(await screen.findByTestId('location')).toHaveTextContent('/r/pizza-palace/orders/99?tableId=7');
  });

  it('requires a table QR before placing orders', async () => {
    const { toast } = await import('react-toastify');

    renderCart('/r/pizza-palace/cart');

    fireEvent.click(await screen.findByRole('button', { name: 'Place order' }));

    expect(toast.error).toHaveBeenCalledWith('Please scan the table QR code before ordering.');
    expect(orderService.placeOrder).not.toHaveBeenCalled();
  });
});
