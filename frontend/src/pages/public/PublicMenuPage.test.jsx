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
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicMenuPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        imageUrl: '',
      },
    ]);
  });

  it('loads categories and menu items from public services', async () => {
    renderMenu();

    expect(await screen.findByRole('heading', { name: 'Choose your dishes' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pizza' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Margherita' })).toBeInTheDocument();
  });

  it('filters public menu by food type and sorts by price', async () => {
    renderMenu();

    expect(await screen.findByRole('heading', { name: 'Chicken Pepperoni' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filter by food type'), { target: { value: 'VEG' } });
    expect(screen.getByRole('heading', { name: 'Margherita' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Chicken Pepperoni' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filter by food type'), { target: { value: '' } });
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
});
