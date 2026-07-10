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

export async function getOrderTimeline(orderId) {
  const response = await apiClient.get(`/orders/${orderId}/timeline`);
  return response.data;
}

export async function getCurrentTableOrders(tableId) {
  const response = await apiClient.get(`/orders/table/${tableId}`);
  return response.data;
}

export async function getRestaurantOrders(filters = {}) {
  const params = typeof filters === 'string'
    ? (filters ? { status: filters } : {})
    : Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined));

  const response = await apiClient.get('/orders', {
    params,
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

export async function getWaiterServedOrders() {
  const response = await apiClient.get('/waiter/orders/served');
  return response.data;
}

export async function markServed(orderId) {
  const response = await apiClient.patch(`/waiter/orders/${orderId}/served`);
  return response.data;
}
