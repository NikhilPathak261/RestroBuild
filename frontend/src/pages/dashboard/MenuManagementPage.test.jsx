import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as categoryService from '../../services/categoryService';
import * as menuService from '../../services/menuService';
import * as uploadService from '../../services/uploadService';
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

vi.mock('../../services/uploadService', () => ({
  uploadMedia: vi.fn(),
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
    fireEvent.change(screen.getByLabelText('Image URL'), { target: { value: 'https://example.com/pizza.jpg' } });
    expect(screen.getByRole('img', { name: 'Dish preview' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Spicy level'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Sweet level'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create dish' }));

    await waitFor(() => {
      expect(menuService.createMenuItem).toHaveBeenCalledWith({
        categoryId: 4,
        name: 'Farmhouse Pizza',
        description: 'Loaded with vegetables',
        price: 349.5,
        imageUrl: 'https://example.com/pizza.jpg',
        foodType: 'VEG',
        spicyLevel: 2,
        sweetLevel: 0,
        preparationTime: 18,
        available: true,
      });
    });
    expect(toast.success).toHaveBeenCalledWith('Menu item created.');
  });

  it('uploads a dish image before saving the menu item', async () => {
    menuService.createMenuItem.mockResolvedValue({ id: 9 });
    uploadService.uploadMedia.mockResolvedValue({ url: 'http://localhost:8080/uploads/media/dish.webp' });

    render(<MenuManagementPage />);

    await screen.findByRole('option', { name: 'Pizza' });
    fireEvent.change(screen.getByLabelText('Upload dish image'), {
      target: { files: [new File(['dish'], 'dish.webp', { type: 'image/webp' })] },
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Image URL')).toHaveValue('http://localhost:8080/uploads/media/dish.webp');
    });

    fireEvent.change(screen.getByLabelText('Category'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Dish name'), { target: { value: 'Farmhouse Pizza' } });
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '349.50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create dish' }));

    await waitFor(() => {
      expect(menuService.createMenuItem).toHaveBeenCalledWith(expect.objectContaining({
        imageUrl: 'http://localhost:8080/uploads/media/dish.webp',
      }));
    });
  });

  it('shows dish thumbnails in the menu list', async () => {
    menuService.getMenuItems.mockResolvedValue([
      {
        id: 9,
        categoryId: 4,
        categoryName: 'Pizza',
        name: 'Farmhouse Pizza',
        description: 'Loaded with vegetables',
        price: 349.5,
        imageUrl: 'https://example.com/pizza.jpg',
        foodType: 'VEG',
        spicyLevel: 2,
        sweetLevel: 0,
        preparationTime: 18,
        available: true,
        hidden: false,
      },
    ]);

    render(<MenuManagementPage />);

    expect(await screen.findByRole('img', { name: 'Farmhouse Pizza' })).toHaveAttribute(
      'src',
      'https://example.com/pizza.jpg',
    );
    expect(screen.getByText('Rs. 349.5')).toBeInTheDocument();
  });

  it('refreshes menu data', async () => {
    render(<MenuManagementPage />);

    await screen.findByRole('option', { name: 'Pizza' });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh menu' }));

    await waitFor(() => {
      expect(categoryService.getCategories).toHaveBeenCalledTimes(2);
      expect(menuService.getMenuItems).toHaveBeenCalledTimes(2);
    });
  });
});
