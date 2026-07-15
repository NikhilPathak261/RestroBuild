import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PublicLayout from './PublicLayout';

describe('PublicLayout', () => {
  it('preserves tableId across public navigation links', () => {
    render(
      <MemoryRouter initialEntries={['/r/spice-house/menu?tableId=9']}>
        <Routes>
          <Route path="/r/:restaurantSlug/menu" element={<PublicLayout />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('link', { name: 'RestroBuild' })).toHaveAttribute('href', '/r/spice-house?tableId=9');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/r/spice-house?tableId=9');
    expect(screen.getByRole('link', { name: 'Menu' })).toHaveAttribute('href', '/r/spice-house/menu?tableId=9');
    expect(screen.getByRole('link', { name: 'Cart' })).toHaveAttribute('href', '/r/spice-house/cart?tableId=9');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/r/spice-house/about?tableId=9');
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/r/spice-house/contact?tableId=9');
  });

  it('renders routed public content inside the main landmark', () => {
    render(
      <MemoryRouter initialEntries={['/r/spice-house/menu']}>
        <Routes>
          <Route path="/r/:restaurantSlug/menu" element={<PublicLayout />}>
            <Route index element={<h1>Public menu</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(within(screen.getByRole('main')).getByRole('heading', { name: 'Public menu' })).toBeInTheDocument();
  });
});
