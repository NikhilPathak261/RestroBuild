import { describe, expect, it, vi } from 'vitest';
import apiClient from './apiClient';
import { uploadMedia } from './uploadService';

vi.mock('./apiClient', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('uploadService', () => {
  it('uploads media using multipart form data', async () => {
    const file = new File(['image'], 'dish.png', { type: 'image/png' });
    apiClient.post.mockResolvedValue({
      data: {
        data: {
          url: 'http://localhost:8080/uploads/media/dish.png',
        },
      },
    });

    const response = await uploadMedia(file);

    expect(apiClient.post).toHaveBeenCalledWith(
      '/uploads/media',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    expect(response).toEqual({ url: 'http://localhost:8080/uploads/media/dish.png' });
  });
});
