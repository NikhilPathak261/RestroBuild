import apiClient from './apiClient';

export async function registerOwner(payload) {
  const response = await apiClient.post('/auth/register', payload);
  return response.data;
}

export async function login(payload) {
  const response = await apiClient.post('/auth/login', payload);
  return response.data;
}
