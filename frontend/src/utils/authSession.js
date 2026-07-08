import { STORAGE_KEYS } from '../constants/storageKeys';

export const AUTH_EXPIRED_EVENT = 'restrobuild:auth-expired';

export function getStoredAccessToken() {
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(STORAGE_KEYS.refreshToken);
}

export function storeAccessToken(accessToken) {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
}

export function storeAuthSession(auth) {
  localStorage.setItem(STORAGE_KEYS.accessToken, auth.accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, auth.refreshToken);
  localStorage.setItem(STORAGE_KEYS.role, auth.role);
}

export function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.role);
}

export function notifyAuthExpired() {
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}
