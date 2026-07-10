import { beforeEach, describe, expect, it } from 'vitest';
import { clearPublicCart, getPublicCartKey, loadPublicCart, savePublicCart } from './publicCart';

describe('publicCart utilities', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('stores and loads a table-scoped cart', () => {
    savePublicCart('spice-house', '4', {
      items: [{ id: 1, name: 'Paneer Tikka', quantity: 2 }],
      specialInstructions: 'Less spicy',
    });

    expect(loadPublicCart('spice-house', '4')).toEqual({
      items: [{ id: 1, name: 'Paneer Tikka', quantity: 2 }],
      specialInstructions: 'Less spicy',
    });
  });

  it('clears empty carts', () => {
    savePublicCart('spice-house', '4', { items: [], specialInstructions: '' });

    expect(window.localStorage.getItem(getPublicCartKey('spice-house', '4'))).toBeNull();

    savePublicCart('spice-house', '4', { items: [{ id: 1 }], specialInstructions: '' });
    clearPublicCart('spice-house', '4');

    expect(loadPublicCart('spice-house', '4')).toEqual({ items: [], specialInstructions: '' });
  });
});
