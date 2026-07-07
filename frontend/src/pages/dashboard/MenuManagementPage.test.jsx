import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as categoryService from '../../services/categoryService';
import * as menuService from '../../services/menuService';
import MenuManagementPage from './MenuManagementPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/categoryService', () => ({
  getCategories: vi.fn(),
}));

vi.mock('../../services/menuService', () => ({
  getMenuItems: vi.fn(),
  createMenuItem: vi.fn(),
  updateMenuItem: vi.fn(),
  deleteMenuItem: vi.fn(),
  hideMenuItem: vi.fn(),
  showMenuItem: vi.fn(),
  updateAvailability: vi.fn(),
}));

describe('MenuManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryService.getCategories.mockResolvedValue([{ id: 4, name: 'Pizza' }]);
    menuService.getMenuItems.mockResolvedValue([]);
  });

  it('creates a menu item with normalized numeric fields', async () => {
    const { toast } = await import('react-toastify');
    menuService.createMenuItem.mockResolvedValue({ id: 9 });

    render(<MenuManagementPage />);

    await screen.findByRole('option', { name: 'Pizza' });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Dish name'), { target: { value: 'Farmhouse Pizza' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Loaded with vegetables' } });
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '349.50' } });
    fireEvent.change(screen.getByLabelText('Preparation time'), { target: { value: '18' } });
    fireEvent.change(screen.getByLabelText('Spicy level'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Sweet level'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create dish' }));

    await waitFor(() => {
      expect(menuService.createMenuItem).toHaveBeenCalledWith({
        categoryId: 4,
        name: 'Farmhouse Pizza',
        description: 'Loaded with vegetables',
        price: 349.5,
        imageUrl: '',
        foodType: 'VEG',
        spicyLevel: 2,
        sweetLevel: 0,
        preparationTime: 18,
        available: true,
      });
    });
    expect(toast.success).toHaveBeenCalledWith('Menu item created.');
  });
});
