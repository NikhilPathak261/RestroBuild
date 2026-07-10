import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePublicWebsite } from '../../hooks/usePublicWebsite';
import * as tableService from '../../services/tableService';
import PublicHomePage from './PublicHomePage';

vi.mock('../../hooks/usePublicWebsite', () => ({
  usePublicWebsite: vi.fn(),
}));

vi.mock('../../services/tableService', () => ({
  validateQr: vi.fn(),
}));

function renderHome(path = '/r/spice-house?tableId=9') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/r/:restaurantSlug" element={<PublicHomePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePublicWebsite.mockReturnValue({
      restaurant: {
        name: 'Spice House',
        slug: 'spice-house',
        about: 'Fresh food daily.',
        primaryColor: '#B42318',
        secondaryColor: '#FFFFFF',
      },
      isLoading: false,
      error: '',
    });
    tableService.validateQr.mockResolvedValue({
      restaurantSlug: 'spice-house',
      tableId: 9,
      tableNumber: 12,
    });
  });

  it('validates table QR context and preserves it in public links', async () => {
    renderHome();

    expect(await screen.findByText('Table 12')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View menu' })).toHaveAttribute('href', '/r/spice-house/menu?tableId=9');
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/r/spice-house/contact?tableId=9');
    expect(tableService.validateQr).toHaveBeenCalledWith('9');
  });

  it('shows an error when QR context belongs to another restaurant', async () => {
    tableService.validateQr.mockResolvedValue({
      restaurantSlug: 'other-restaurant',
      tableId: 9,
      tableNumber: 12,
    });

    renderHome();

    expect(await screen.findByRole('heading', { name: 'This table QR does not belong to this restaurant.' })).toBeInTheDocument();
  });
});
