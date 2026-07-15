import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as cartService from '../../services/cartService';
import * as categoryService from '../../services/categoryService';
import * as menuService from '../../services/menuService';
import * as orderService from '../../services/orderService';
import PublicMenuPage from './PublicMenuPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/categoryService', () => ({
  getPublicCategories: vi.fn(),
}));

vi.mock('../../services/menuService', () => ({
  getPublicMenu: vi.fn(),
}));

vi.mock('../../services/cartService', () => ({
  getCart: vi.fn(),
  addCartItem: vi.fn(),
  updateCartItem: vi.fn(),
  removeCartItem: vi.fn(),
  clearCart: vi.fn(),
}));

vi.mock('../../services/orderService', () => ({
  getCurrentTableOrders: vi.fn(),
  placeOrder: vi.fn(),
}));

const emptyCart = {
  cartToken: null,
  items: [],
  subtotal: 0,
};

const pepperoniCart = {
  cartToken: 'cart-token-1',
  items: [
    {
      id: 101,
      menuItemId: 12,
      menuItemName: 'Chicken Pepperoni',
      quantity: 1,
      price: 399,
      subtotal: 399,
      specialInstructions: '',
    },
  ],
  subtotal: 399,
};

const doublePepperoniCart = {
  ...pepperoniCart,
  items: [
    {
      ...pepperoniCart.items[0],
      quantity: 2,
      subtotal: 798,
    },
  ],
  subtotal: 798,
};

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderMenu(initialPath = '/r/pizza-palace/menu?tableId=7') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/r/:restaurantSlug/menu" element={<PublicMenuPage />} />
        <Route path="/r/:restaurantSlug/orders/:orderId" element={<LocationProbe />} />
        <Route path="/r/:restaurantSlug/bill/:orderId" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicMenuPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderService.getCurrentTableOrders.mockResolvedValue([]);
    cartService.getCart.mockResolvedValue(emptyCart);
    cartService.addCartItem.mockResolvedValue(pepperoniCart);
    cartService.updateCartItem.mockResolvedValue(doublePepperoniCart);
    cartService.clearCart.mockResolvedValue();
    categoryService.getPublicCategories.mockResolvedValue([{ id: 1, name: 'Pizza' }]);
    menuService.getPublicMenu.mockResolvedValue([
      {
        id: 11,
        name: 'Margherita',
        description: 'Classic tomato and cheese',
        categoryId: 1,
        categoryName: 'Pizza',
        price: 299,
        foodType: 'VEG',
        spicyLevel: 1,
        sweetLevel: 2,
        imageUrl: '',
      },
      {
        id: 12,
        name: 'Chicken Pepperoni',
        description: 'Loaded pepperoni pizza',
        categoryId: 1,
        categoryName: 'Pizza',
        price: 399,
        foodType: 'NON_VEG',
        spicyLevel: 3,
        sweetLevel: 0,
        imageUrl: '',
      },
    ]);
  });

  it('loads categories and menu items from public services', async () => {
    renderMenu();

    expect(await screen.findByRole('heading', { name: 'Choose your dishes' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pizza' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Margherita' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'View details' })[0]).toHaveAttribute('href', '/r/pizza-palace/menu/12?tableId=7');
    expect(orderService.getCurrentTableOrders).toHaveBeenCalledWith(7);
  });

  it('shows active table orders with tracking and bill links', async () => {
    orderService.getCurrentTableOrders.mockResolvedValue([
      {
        id: 55,
        status: 'PREPARING',
        totalAmount: 698,
        items: [
          { id: 1, menuItemName: 'Margherita' },
          { id: 2, menuItemName: 'Chicken Pepperoni' },
        ],
      },
    ]);

    renderMenu();

    expect(await screen.findByRole('heading', { name: 'Order #55' })).toBeInTheDocument();
    expect(screen.getByText('preparing')).toBeInTheDocument();
    expect(screen.getByText('2 items - Rs. 698')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Track' })).toHaveAttribute('href', '/r/pizza-palace/orders/55?tableId=7');
    expect(screen.getByRole('link', { name: 'Bill' })).toHaveAttribute('href', '/r/pizza-palace/bill/55?tableId=7');
  });

  it('filters public menu by food type, taste levels, and sorts by price', async () => {
    renderMenu();

    expect(await screen.findByRole('heading', { name: 'Chicken Pepperoni' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filter by food type'), { target: { value: 'VEG' } });
    expect(screen.getByRole('heading', { name: 'Margherita' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Chicken Pepperoni' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filter by food type'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Filter by spicy level'), { target: { value: '3' } });
    expect(screen.getByRole('heading', { name: 'Chicken Pepperoni' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Margherita' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filter by spicy level'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Filter by sweet level'), { target: { value: '2' } });
    expect(screen.getByRole('heading', { name: 'Margherita' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Chicken Pepperoni' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filter by sweet level'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Sort menu'), { target: { value: 'PRICE_DESC' } });

    const menuItems = screen.getAllByRole('article');
    expect(menuItems[0]).toHaveTextContent('Chicken Pepperoni');
    expect(menuItems[1]).toHaveTextContent('Margherita');
  });

  it('requires a table QR before placing the cart order', async () => {
    const { toast } = await import('react-toastify');
    renderMenu('/r/pizza-palace/menu');

    fireEvent.click((await screen.findAllByRole('button', { name: 'Add to cart' }))[0]);
    await screen.findByText('Chicken Pepperoni');
    fireEvent.click(screen.getByRole('button', { name: 'Place order' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please scan the table QR code before ordering.');
    });
    expect(orderService.placeOrder).not.toHaveBeenCalled();
    expect(orderService.getCurrentTableOrders).not.toHaveBeenCalled();
  });

  it('places a cart order and navigates to order tracking', async () => {
    const { toast } = await import('react-toastify');
    orderService.placeOrder.mockResolvedValue({ id: 99 });
    cartService.updateCartItem.mockImplementation((cartItemId, payload) => Promise.resolve({
      ...doublePepperoniCart,
      items: [{ ...doublePepperoniCart.items[0], specialInstructions: payload.specialInstructions }],
    }));
    renderMenu();

    fireEvent.click((await screen.findAllByRole('button', { name: 'Add to cart' }))[0]);
    await screen.findByText('Chicken Pepperoni');
    fireEvent.click(screen.getByRole('button', { name: 'Add one Chicken Pepperoni' }));
    await screen.findByText('Rs. 798');
    fireEvent.change(screen.getByLabelText('Special instructions'), { target: { value: 'Less spicy' } });
    fireEvent.click(screen.getByRole('button', { name: 'Place order' }));

    await waitFor(() => {
      expect(orderService.placeOrder).toHaveBeenCalledWith({
        tableId: 7,
        items: [{ menuItemId: 12, quantity: 2 }],
        specialInstructions: 'Less spicy',
      });
    });

    expect(cartService.addCartItem).toHaveBeenCalledWith({
      menuItemId: 12,
      quantity: 1,
      specialInstructions: '',
    });
    expect(cartService.updateCartItem).toHaveBeenCalledWith(101, {
      quantity: 2,
      specialInstructions: '',
    });
    expect(cartService.updateCartItem).toHaveBeenCalledWith(101, {
      quantity: 2,
      specialInstructions: 'Less spicy',
    });
    expect(cartService.clearCart).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Order placed.');
    expect(await screen.findByTestId('location')).toHaveTextContent('/r/pizza-palace/orders/99?tableId=7');
  });

  it('shows backend cart items and links to the standalone cart page', async () => {
    cartService.getCart.mockResolvedValue(pepperoniCart);
    renderMenu();

    expect((await screen.findAllByText('Chicken Pepperoni'))[0]).toBeInTheDocument();
    expect(screen.getAllByText('Rs. 399')[0]).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Review cart' })).toHaveAttribute('href', '/r/pizza-palace/cart?tableId=7');
  });
});
