import apiClient from './apiClient';

export async function createTables(numberOfTables) {
  const response = await apiClient.post('/tables', { numberOfTables });
  return response.data;
}

export async function getTables() {
  const response = await apiClient.get('/tables');
  return response.data;
}

export async function updateTable(tableId, tableNumber) {
  const response = await apiClient.put(`/tables/${tableId}`, { tableNumber });
  return response.data;
}

export async function deleteTable(tableId) {
  const response = await apiClient.delete(`/tables/${tableId}`);
  return response.data;
}

export async function generateQrCodes() {
  const response = await apiClient.post('/qr/generate');
  return response.data;
}

export async function regenerateQr(tableId) {
  const response = await apiClient.post(`/qr/regenerate/${tableId}`);
  return response.data;
}
