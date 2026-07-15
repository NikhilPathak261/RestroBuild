import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../constants/storageKeys';
import apiClient from './apiClient';
import {
  addCartItem,
  clearCart,
  getCart,
  updateCartItem,
} from './cartService';

vi.mock('./apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('cartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('stores a returned anonymous cart token and reuses it for later requests', async () => {
    const cart = { cartToken: 'cart-token-1', items: [], subtotal: 0 };
    apiClient.post.mockResolvedValue({ data: cart });
    apiClient.put.mockResolvedValue({ data: cart });

    await expect(addCartItem({ menuItemId: 12, quantity: 1 })).resolves.toEqual(cart);

    expect(apiClient.post).toHaveBeenCalledWith('/cart/items', { menuItemId: 12, quantity: 1 }, {});
    expect(sessionStorage.getItem(STORAGE_KEYS.publicCartToken)).toBe('cart-token-1');

    await updateCartItem(101, { quantity: 2, specialInstructions: 'Less spicy' });

    expect(apiClient.put).toHaveBeenCalledWith(
      '/cart/items/101',
      { quantity: 2, specialInstructions: 'Less spicy' },
      { headers: { 'X-Cart-Token': 'cart-token-1' } },
    );
  });

  it('sends the stored cart token when fetching and clearing the cart', async () => {
    sessionStorage.setItem(STORAGE_KEYS.publicCartToken, 'cart-token-2');
    apiClient.get.mockResolvedValue({ data: { cartToken: 'cart-token-2', items: [], subtotal: 0 } });
    apiClient.delete.mockResolvedValue({ data: null });

    await getCart();
    await clearCart();

    expect(apiClient.get).toHaveBeenCalledWith('/cart', { headers: { 'X-Cart-Token': 'cart-token-2' } });
    expect(apiClient.delete).toHaveBeenCalledWith('/cart', { headers: { 'X-Cart-Token': 'cart-token-2' } });
    expect(sessionStorage.getItem(STORAGE_KEYS.publicCartToken)).toBeNull();
  });
});
