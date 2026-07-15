import apiClient from './apiClient';
import {
  clearStoredPublicCartToken,
  getStoredPublicCartToken,
  storePublicCartToken,
} from '../utils/publicCartSession';

const CART_TOKEN_HEADER = 'X-Cart-Token';

function cartTokenConfig() {
  const cartToken = getStoredPublicCartToken();
  return cartToken ? { headers: { [CART_TOKEN_HEADER]: cartToken } } : {};
}

function rememberCartToken(cart) {
  if (cart?.cartToken) {
    storePublicCartToken(cart.cartToken);
  }

  return cart;
}

export async function getCart() {
  const response = await apiClient.get('/cart', cartTokenConfig());
  return rememberCartToken(response.data);
}

export async function addCartItem(payload) {
  const response = await apiClient.post('/cart/items', payload, cartTokenConfig());
  return rememberCartToken(response.data);
}

export async function updateCartItem(cartItemId, payload) {
  const response = await apiClient.put(`/cart/items/${cartItemId}`, payload, cartTokenConfig());
  return rememberCartToken(response.data);
}

export async function removeCartItem(cartItemId) {
  const response = await apiClient.delete(`/cart/items/${cartItemId}`, cartTokenConfig());
  return rememberCartToken(response.data);
}

export async function clearCart() {
  await apiClient.delete('/cart', cartTokenConfig());
  clearStoredPublicCartToken();
}
