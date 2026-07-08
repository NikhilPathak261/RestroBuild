import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './apiError';

describe('getApiErrorMessage', () => {
  it('uses the backend message when present', () => {
    const error = {
      response: {
        data: { message: 'Invalid order status.' },
      },
    };

    expect(getApiErrorMessage(error, 'Failed to update order.')).toBe('Invalid order status.');
  });

  it('falls back and appends response request IDs', () => {
    const error = {
      response: {
        headers: {
          'x-request-id': 'request-123',
        },
      },
    };

    expect(getApiErrorMessage(error, 'Failed to load orders.')).toBe('Failed to load orders. (Request ID: request-123)');
  });
});
