import apiClient from './apiClient';

export async function getWebsiteSettings() {
  const response = await apiClient.get('/website');
  return response.data;
}

export async function updateTheme(payload) {
  const response = await apiClient.put('/website/theme', payload);
  return response.data;
}

export async function updateAbout(payload) {
  const response = await apiClient.put('/website/about', payload);
  return response.data;
}

export async function publishWebsite() {
  const response = await apiClient.post('/website/publish');
  return response.data;
}

export async function getPublicWebsite(restaurantSlug) {
  const response = await apiClient.get(`/public/${restaurantSlug}`);
  return response.data;
}
