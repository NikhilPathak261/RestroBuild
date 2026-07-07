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

export async function getRestaurantOrders(status) {
  const response = await apiClient.get('/orders', {
    params: status ? { status } : {},
  });
  return response.data;
}

export async function cancelOrder(orderId) {
  const response = await apiClient.patch(`/orders/${orderId}/cancel`);
  return response.data;
}

export async function markPreparing(orderId) {
  const response = await apiClient.patch(`/kitchen/orders/${orderId}/prepare`);
  return response.data;
}

export async function getKitchenPendingOrders() {
  const response = await apiClient.get('/kitchen/orders/pending');
  return response.data;
}

export async function getKitchenPreparingOrders() {
  const response = await apiClient.get('/kitchen/orders/preparing');
  return response.data;
}

export async function getKitchenReadyOrders() {
  const response = await apiClient.get('/kitchen/orders/ready');
  return response.data;
}

export async function markReady(orderId) {
  const response = await apiClient.patch(`/kitchen/orders/${orderId}/ready`);
  return response.data;
}

export async function getWaiterReadyOrders() {
  const response = await apiClient.get('/waiter/orders/ready');
  return response.data;
}

export async function markServed(orderId) {
  const response = await apiClient.patch(`/waiter/orders/${orderId}/served`);
  return response.data;
}
