import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as restaurantService from '../../services/restaurantService';
import RestaurantProfilePage from './RestaurantProfilePage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/restaurantService', () => ({
  getMyRestaurant: vi.fn(),
  createRestaurant: vi.fn(),
  updateRestaurant: vi.fn(),
}));

function fillRestaurantForm(name = 'Spice House') {
  fireEvent.change(screen.getByLabelText('Restaurant name'), { target: { value: name } });
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Fresh Indian meals' } });
  fireEvent.change(screen.getByLabelText('Address'), { target: { value: '12 Market Street' } });
  fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '9999999999' } });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@spice.test' } });
  fireEvent.change(screen.getByLabelText('Opening hours'), { target: { value: '10 AM - 10 PM' } });
}

describe('RestaurantProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a restaurant when no profile exists', async () => {
    const { toast } = await import('react-toastify');
    restaurantService.getMyRestaurant.mockRejectedValue({ response: { status: 404 } });
    restaurantService.createRestaurant.mockResolvedValue({ id: 21 });

    render(<RestaurantProfilePage />);

    expect(await screen.findByRole('heading', { name: 'Create your restaurant' })).toBeInTheDocument();
    fillRestaurantForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create restaurant' }));

    await waitFor(() => {
      expect(restaurantService.createRestaurant).toHaveBeenCalledWith({
        name: 'Spice House',
        description: 'Fresh Indian meals',
        address: '12 Market Street',
        phone: '9999999999',
        email: 'owner@spice.test',
        openingHours: '10 AM - 10 PM',
      });
    });
    expect(toast.success).toHaveBeenCalledWith('Restaurant created.');
  });

  it('loads and updates an existing restaurant', async () => {
    const { toast } = await import('react-toastify');
    restaurantService.getMyRestaurant.mockResolvedValue({
      id: 8,
      name: 'Old Name',
      description: 'Old description',
      address: 'Old address',
      phone: '111',
      email: 'old@test.local',
      openingHours: '9 AM - 9 PM',
    });
    restaurantService.updateRestaurant.mockResolvedValue({ id: 8 });

    render(<RestaurantProfilePage />);

    expect(await screen.findByDisplayValue('Old Name')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Restaurant name'), { target: { value: 'New Name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(restaurantService.updateRestaurant).toHaveBeenCalledWith({
        name: 'New Name',
        description: 'Old description',
        address: 'Old address',
        phone: '111',
        email: 'old@test.local',
        openingHours: '9 AM - 9 PM',
      });
    });
    expect(toast.success).toHaveBeenCalledWith('Restaurant updated.');
  });
});
