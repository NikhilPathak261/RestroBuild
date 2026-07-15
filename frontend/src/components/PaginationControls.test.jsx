import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PaginationControls from './PaginationControls';

describe('PaginationControls', () => {
  it('hides itself when all items fit on one page', () => {
    const { container } = render(
      <PaginationControls currentPage={1} totalItems={5} pageSize={10} onPageChange={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows range and moves between pages', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls currentPage={2} totalItems={25} pageSize={10} label="orders" onPageChange={onPageChange} />,
    );

    expect(screen.getByText('Showing 11-20 of 25 orders')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });
});
