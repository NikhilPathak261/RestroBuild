import { afterEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS } from '../constants/storageKeys';
import {
  clearStoredPublicCartToken,
  getStoredPublicCartToken,
  storePublicCartToken,
} from './publicCartSession';

describe('publicCartSession', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('stores, reads, and clears the anonymous public cart token', () => {
    expect(getStoredPublicCartToken()).toBeNull();

    storePublicCartToken('cart-token-1');

    expect(getStoredPublicCartToken()).toBe('cart-token-1');
    expect(sessionStorage.getItem(STORAGE_KEYS.publicCartToken)).toBe('cart-token-1');

    clearStoredPublicCartToken();

    expect(getStoredPublicCartToken()).toBeNull();
  });

  it('ignores empty cart tokens', () => {
    storePublicCartToken('');

    expect(getStoredPublicCartToken()).toBeNull();
  });
});
