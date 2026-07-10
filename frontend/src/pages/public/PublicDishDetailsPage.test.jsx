import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as menuService from '../../services/menuService';
import * as reviewService from '../../services/reviewService';
import PublicDishDetailsPage from './PublicDishDetailsPage';

vi.mock('../../services/menuService', () => ({
  getPublicMenuItem: vi.fn(),
}));

vi.mock('../../services/reviewService', () => ({
  getPublicMenuItemReviews: vi.fn(),
}));

describe('PublicDishDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    menuService.getPublicMenuItem.mockResolvedValue({
      id: 12,
      categoryName: 'Pizza',
      name: 'Chicken Pepperoni',
      description: 'Loaded pepperoni pizza',
      price: 399,
      foodType: 'NON_VEG',
      preparationTime: 18,
      spicyLevel: 3,
      sweetLevel: 0,
      imageUrl: 'https://example.com/pizza.jpg',
    });
    reviewService.getPublicMenuItemReviews.mockResolvedValue([
      { id: 1, rating: 5, comment: 'Crispy and hot.' },
    ]);
  });

  it('renders dish details and public reviews', async () => {
    render(
      <MemoryRouter initialEntries={['/r/cafe/menu/12?tableId=4']}>
        <Routes>
          <Route path="/r/:restaurantSlug/menu/:menuItemId" element={<PublicDishDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Chicken Pepperoni' })).toBeInTheDocument();
    expect(screen.getByText('Loaded pepperoni pizza')).toBeInTheDocument();
    expect(screen.getByText('Rs. 399')).toBeInTheDocument();
    expect(screen.getByText('Non-veg')).toBeInTheDocument();
    expect(screen.getByText('18 min')).toBeInTheDocument();
    expect(screen.getByText('Crispy and hot.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to menu' })).toHaveAttribute('href', '/r/cafe/menu?tableId=4');
    expect(menuService.getPublicMenuItem).toHaveBeenCalledWith('cafe', '12');
    expect(reviewService.getPublicMenuItemReviews).toHaveBeenCalledWith('12');
  });
});
