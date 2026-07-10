import axios from 'axios';
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  notifyAuthExpired,
  storeAccessToken,
} from '../utils/authSession';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => unwrapApiResponse(response),
  async (error) => {
    const originalRequest = error.config;

    if (!shouldRefresh(error, originalRequest)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAuthSession();
      notifyAuthExpired();
      return Promise.reject(refreshError);
    }
  },
);

export function unwrapApiResponse(response) {
  if (!response?.data || typeof response.data !== 'object' || !('success' in response.data)) {
    return response;
  }

  return {
    ...response,
    data: response.data.data ?? null,
  };
}

function shouldRefresh(error, originalRequest) {
  return Boolean(
    error.response?.status === 401
    && originalRequest
    && !originalRequest._retry
    && !originalRequest.url?.includes('/auth/refresh')
    && getStoredRefreshToken(),
  );
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh', { refreshToken: getStoredRefreshToken() })
      .then((response) => {
        const accessToken = response.data.data.accessToken;
        storeAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export default apiClient;
