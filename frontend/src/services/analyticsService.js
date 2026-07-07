import apiClient from './apiClient';

export async function getSummary() {
  const response = await apiClient.get('/analytics/summary');
  return response.data;
}

export async function getDailyRevenue() {
  const response = await apiClient.get('/analytics/revenue/daily');
  return response.data;
}

export async function getTopMenuItems() {
  const response = await apiClient.get('/analytics/menu-items/top');
  return response.data;
}

export async function getBottomMenuItems() {
  const response = await apiClient.get('/analytics/menu-items/bottom');
  return response.data;
}

export async function getCategoryStats() {
  const response = await apiClient.get('/analytics/categories');
  return response.data;
}

export async function getRatingsSummary() {
  const response = await apiClient.get('/analytics/ratings');
  return response.data;
}
