import apiClient from './apiClient';

export async function getStaff() {
  const response = await apiClient.get('/staff');
  return response.data;
}

export async function createStaff(payload) {
  const response = await apiClient.post('/staff', payload);
  return response.data;
}

export async function updateStaff(staffId, payload) {
  const response = await apiClient.put(`/staff/${staffId}`, payload);
  return response.data;
}

export async function enableStaff(staffId) {
  const response = await apiClient.patch(`/staff/${staffId}/enable`);
  return response.data;
}

export async function disableStaff(staffId) {
  const response = await apiClient.patch(`/staff/${staffId}/disable`);
  return response.data;
}

export async function deleteStaff(staffId) {
  const response = await apiClient.delete(`/staff/${staffId}`);
  return response.data;
}
