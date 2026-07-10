import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

vi.mock('../../services/orderService', () => ({
  getCurrentTableOrders: vi.fn(),
  placeOrder: vi.fn(),
}));

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
    window.localStorage.clear();
    orderService.getCurrentTableOrders.mockResolvedValue([]);
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

    fireEvent.click((await screen.findAllByRole('button', { name: 'Add to order' }))[0]);
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
    renderMenu();

    fireEvent.click((await screen.findAllByRole('button', { name: 'Add to order' }))[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Add one Chicken Pepperoni' }));
    fireEvent.change(screen.getByLabelText('Special instructions'), { target: { value: 'Less spicy' } });
    fireEvent.click(screen.getByRole('button', { name: 'Place order' }));

    await waitFor(() => {
      expect(orderService.placeOrder).toHaveBeenCalledWith({
        tableId: 7,
        items: [{ menuItemId: 12, quantity: 2 }],
        specialInstructions: 'Less spicy',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Order placed.');
    expect(await screen.findByTestId('location')).toHaveTextContent('/r/pizza-palace/orders/99?tableId=7');
  });

  it('persists cart items for the standalone cart page', async () => {
    renderMenu();

    fireEvent.click((await screen.findAllByRole('button', { name: 'Add to order' }))[0]);

    expect(screen.getByRole('link', { name: 'Review cart' })).toHaveAttribute('href', '/r/pizza-palace/cart?tableId=7');
    expect(window.localStorage.getItem('restrobuild:public-cart:pizza-palace:7')).toContain('Chicken Pepperoni');
  });
});
