import apiClient from './apiClient';

export async function getCategories() {
  const response = await apiClient.get('/categories');
  return response.data;
}

export async function createCategory(payload) {
  const response = await apiClient.post('/categories', payload);
  return response.data;
}

export async function updateCategory(categoryId, payload) {
  const response = await apiClient.put(`/categories/${categoryId}`, payload);
  return response.data;
}

export async function deleteCategory(categoryId) {
  const response = await apiClient.delete(`/categories/${categoryId}`);
  return response.data;
}

export async function getPublicCategories(restaurantSlug) {
  const response = await apiClient.get(`/public/${restaurantSlug}/categories`);
  return response.data;
}
