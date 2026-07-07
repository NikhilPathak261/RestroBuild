import apiClient from './apiClient';

export async function getMyRestaurant() {
  const response = await apiClient.get('/restaurants/me');
  return response.data;
}

export async function createRestaurant(payload) {
  const response = await apiClient.post('/restaurants', payload);
  return response.data;
}

export async function updateRestaurant(payload) {
  const response = await apiClient.put('/restaurants/me', payload);
  return response.data;
}
