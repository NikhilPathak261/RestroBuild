import { STORAGE_KEYS } from '../constants/storageKeys';

export function getStoredPublicCartToken() {
  return sessionStorage.getItem(STORAGE_KEYS.publicCartToken);
}

export function storePublicCartToken(cartToken) {
  if (cartToken) {
    sessionStorage.setItem(STORAGE_KEYS.publicCartToken, cartToken);
  }
}

export function clearStoredPublicCartToken() {
  sessionStorage.removeItem(STORAGE_KEYS.publicCartToken);
}
