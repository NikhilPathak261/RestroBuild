import apiClient from './apiClient';

export async function placeOrder(payload) {
  const response = await apiClient.post('/orders', payload);
  return response.data;
}

export async function getOrder(orderId) {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
}

export async function getOrderStatus(orderId) {
  const response = await apiClient.get(`/orders/${orderId}/status`);
  return response.data;
}
