import apiClient from './apiClient';

export async function submitReview(payload) {
  const response = await apiClient.post('/reviews', payload);
  return response.data;
}

export async function getReviews(params = {}) {
  const response = await apiClient.get('/reviews', { params });
  return response.data;
}

export async function hideReview(reviewId) {
  const response = await apiClient.patch(`/reviews/${reviewId}/hide`);
  return response.data;
}

export async function showReview(reviewId) {
  const response = await apiClient.patch(`/reviews/${reviewId}/show`);
  return response.data;
}

export async function deleteReview(reviewId) {
  const response = await apiClient.delete(`/reviews/${reviewId}`);
  return response.data;
}

export async function getPublicMenuItemReviews(menuItemId) {
  const response = await apiClient.get(`/public/menu-items/${menuItemId}/reviews`);
  return response.data;
}
