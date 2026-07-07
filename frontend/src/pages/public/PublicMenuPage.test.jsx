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

  it('requires a table QR before quick ordering', async () => {
    const { toast } = await import('react-toastify');
    renderMenu('/r/pizza-palace/menu');

    fireEvent.click(await screen.findByRole('button', { name: 'Order 1' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please scan the table QR code before ordering.');
    });
    expect(orderService.placeOrder).not.toHaveBeenCalled();
  });

  it('places a quick order and navigates to order tracking', async () => {
    const { toast } = await import('react-toastify');
    orderService.placeOrder.mockResolvedValue({ id: 99 });
    renderMenu();

    fireEvent.click(await screen.findByRole('button', { name: 'Order 1' }));

    await waitFor(() => {
      expect(orderService.placeOrder).toHaveBeenCalledWith({
        tableId: 7,
        items: [{ menuItemId: 11, quantity: 1 }],
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Order placed.');
    expect(await screen.findByTestId('location')).toHaveTextContent('/r/pizza-palace/orders/99?tableId=7');
  });
});
