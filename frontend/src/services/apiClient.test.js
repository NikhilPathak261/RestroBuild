import { describe, expect, it } from 'vitest';
import { unwrapApiResponse } from './apiClient';

describe('unwrapApiResponse', () => {
  it('unwraps RestroBuild ApiResponse payloads', () => {
    const response = {
      status: 200,
      data: {
        success: true,
        message: 'Fetched successfully.',
        data: [{ id: 1, name: 'Pizza' }],
      },
    };

    expect(unwrapApiResponse(response)).toEqual({
      status: 200,
      data: [{ id: 1, name: 'Pizza' }],
    });
  });

  it('returns null for successful responses without data', () => {
    const response = {
      status: 200,
      data: {
        success: true,
        message: 'Deleted successfully.',
      },
    };

    expect(unwrapApiResponse(response).data).toBeNull();
  });

  it('leaves plain axios responses unchanged', () => {
    const response = { status: 200, data: { accessToken: 'token' } };

    expect(unwrapApiResponse(response)).toBe(response);
  });
});
