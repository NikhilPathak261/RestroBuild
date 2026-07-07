import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as categoryService from '../../services/categoryService';
import CategoryManagementPage from './CategoryManagementPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/categoryService', () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

describe('CategoryManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryService.getCategories.mockResolvedValue([{ id: 1, name: 'Starters', displayOrder: 1 }]);
  });

  it('loads categories and creates a new category', async () => {
    const { toast } = await import('react-toastify');
    categoryService.createCategory.mockResolvedValue({ id: 2, name: 'Mains', displayOrder: 2 });

    render(<CategoryManagementPage />);

    expect(await screen.findByText('Starters')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: 'Mains' } });
    fireEvent.change(screen.getByLabelText('Display order'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create category' }));

    await waitFor(() => {
      expect(categoryService.createCategory).toHaveBeenCalledWith({ name: 'Mains', displayOrder: 2 });
    });
    expect(toast.success).toHaveBeenCalledWith('Category created.');
  });

  it('edits an existing category', async () => {
    const { toast } = await import('react-toastify');
    categoryService.updateCategory.mockResolvedValue({ id: 1, name: 'Appetizers', displayOrder: 3 });

    render(<CategoryManagementPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: 'Appetizers' } });
    fireEvent.change(screen.getByLabelText('Display order'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(categoryService.updateCategory).toHaveBeenCalledWith(1, { name: 'Appetizers', displayOrder: 3 });
    });
    expect(toast.success).toHaveBeenCalledWith('Category updated.');
  });
});
