import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorState, LoadingState } from './PageState';

describe('PageState', () => {
  it('renders loading feedback', () => {
    render(<LoadingState label="Loading menu..." />);

    expect(screen.getByText('Loading menu...')).toBeInTheDocument();
  });

  it('renders an error title and optional message', () => {
    render(<ErrorState title="Menu is not available" message="Please ask staff for help." />);

    expect(screen.getByRole('heading', { name: 'Menu is not available' })).toBeInTheDocument();
    expect(screen.getByText('Please ask staff for help.')).toBeInTheDocument();
  });
});
