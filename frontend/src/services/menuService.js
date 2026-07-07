import apiClient from './apiClient';

export async function getMenuItems() {
  const response = await apiClient.get('/menu-items');
  return response.data;
}

export async function createMenuItem(payload) {
  const response = await apiClient.post('/menu-items', payload);
  return response.data;
}

export async function updateMenuItem(menuItemId, payload) {
  const response = await apiClient.put(`/menu-items/${menuItemId}`, payload);
  return response.data;
}

export async function deleteMenuItem(menuItemId) {
  const response = await apiClient.delete(`/menu-items/${menuItemId}`);
  return response.data;
}

export async function hideMenuItem(menuItemId) {
  const response = await apiClient.patch(`/menu-items/${menuItemId}/hide`);
  return response.data;
}

export async function showMenuItem(menuItemId) {
  const response = await apiClient.patch(`/menu-items/${menuItemId}/show`);
  return response.data;
}

export async function updateAvailability(menuItemId, available) {
  const response = await apiClient.patch(`/menu-items/${menuItemId}/availability`, { available });
  return response.data;
}

export async function getPublicMenu(restaurantSlug) {
  const response = await apiClient.get(`/public/${restaurantSlug}/menu`);
  return response.data;
}
