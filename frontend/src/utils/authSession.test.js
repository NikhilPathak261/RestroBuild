import { afterEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../constants/storageKeys';
import {
  AUTH_EXPIRED_EVENT,
  clearAuthSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  notifyAuthExpired,
  storeAccessToken,
  storeAuthSession,
} from './authSession';

describe('authSession', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('stores and clears auth session values', () => {
    storeAuthSession({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      role: 'ROLE_OWNER',
    });

    expect(getStoredAccessToken()).toBe('access-token');
    expect(getStoredRefreshToken()).toBe('refresh-token');
    expect(localStorage.getItem(STORAGE_KEYS.role)).toBe('ROLE_OWNER');

    storeAccessToken('new-access-token');
    expect(getStoredAccessToken()).toBe('new-access-token');

    clearAuthSession();
    expect(getStoredAccessToken()).toBeNull();
    expect(getStoredRefreshToken()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.role)).toBeNull();
  });

  it('notifies listeners when auth expires', () => {
    const listener = vi.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, listener);

    notifyAuthExpired();

    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
  });
});
