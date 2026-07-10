import { render, screen } from '@testing-library/react';
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

    expect(screen.getByRole('link', { name: 'RestroBuild' })).toHaveAttribute('href', '/r/spice-house?tableId=9');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/r/spice-house?tableId=9');
    expect(screen.getByRole('link', { name: 'Menu' })).toHaveAttribute('href', '/r/spice-house/menu?tableId=9');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/r/spice-house/about?tableId=9');
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/r/spice-house/contact?tableId=9');
  });
});
