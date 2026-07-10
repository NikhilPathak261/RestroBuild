import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePublicWebsite } from '../../hooks/usePublicWebsite';
import PublicAboutPage from './PublicAboutPage';

vi.mock('../../hooks/usePublicWebsite', () => ({
  usePublicWebsite: vi.fn(),
}));

function renderAbout() {
  return render(
    <MemoryRouter initialEntries={['/r/spice-house/about']}>
      <Routes>
        <Route path="/r/:restaurantSlug/about" element={<PublicAboutPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PublicAboutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePublicWebsite.mockReturnValue({
      restaurant: {
        name: 'Spice House',
        about: 'Fresh food daily.',
        coverImageUrl: 'https://example.com/spice-cover.jpg',
        primaryColor: '#B42318',
        secondaryColor: '#FFFFFF',
      },
      isLoading: false,
      error: '',
    });
  });

  it('shows restaurant about content with cover imagery', () => {
    renderAbout();

    expect(screen.getByRole('heading', { name: 'Spice House' })).toBeInTheDocument();
    expect(screen.getByText('Fresh food daily.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Spice House cover' })).toHaveAttribute('src', 'https://example.com/spice-cover.jpg');
  });
});
