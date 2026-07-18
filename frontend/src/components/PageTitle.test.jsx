import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PageTitle from './PageTitle';

function renderWithPath(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <PageTitle />
    </MemoryRouter>,
  );
}

describe('PageTitle', () => {
  it('sets dashboard route titles', async () => {
    renderWithPath('/dashboard/menu');

    await waitFor(() => expect(document.title).toBe('Menu Management | RestroBuild'));
  });

  it('sets dynamic public route titles', async () => {
    renderWithPath('/r/spice-house/orders/42');

    await waitFor(() => expect(document.title).toBe('Order Tracking | RestroBuild'));
  });

  it('falls back for unknown routes', async () => {
    renderWithPath('/missing-page');

    await waitFor(() => expect(document.title).toBe('Page Not Found | RestroBuild'));
  });
});
