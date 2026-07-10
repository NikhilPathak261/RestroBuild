const CART_PREFIX = 'restrobuild:public-cart';

export function getPublicCartKey(restaurantSlug, tableId) {
  return `${CART_PREFIX}:${restaurantSlug}:${tableId || 'no-table'}`;
}

export function loadPublicCart(restaurantSlug, tableId) {
  try {
    const storedCart = window.localStorage.getItem(getPublicCartKey(restaurantSlug, tableId));
    if (!storedCart) {
      return { items: [], specialInstructions: '' };
    }

    const parsedCart = JSON.parse(storedCart);
    return {
      items: Array.isArray(parsedCart.items) ? parsedCart.items : [],
      specialInstructions: parsedCart.specialInstructions || '',
    };
  } catch {
    return { items: [], specialInstructions: '' };
  }
}

export function savePublicCart(restaurantSlug, tableId, cart) {
  if (cart.items.length === 0 && !cart.specialInstructions) {
    clearPublicCart(restaurantSlug, tableId);
    return;
  }

  window.localStorage.setItem(getPublicCartKey(restaurantSlug, tableId), JSON.stringify(cart));
}

export function clearPublicCart(restaurantSlug, tableId) {
  window.localStorage.removeItem(getPublicCartKey(restaurantSlug, tableId));
}
