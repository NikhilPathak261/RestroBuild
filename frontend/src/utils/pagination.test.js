import { describe, expect, it } from 'vitest';
import { clampPage, getPageCount, paginateItems } from './pagination';

describe('pagination utils', () => {
  it('calculates at least one page for empty lists', () => {
    expect(getPageCount(0)).toBe(1);
    expect(getPageCount(21, 10)).toBe(3);
  });

  it('clamps page numbers into the available range', () => {
    expect(clampPage(-2, 25, 10)).toBe(1);
    expect(clampPage(9, 25, 10)).toBe(3);
  });

  it('returns the requested page slice', () => {
    const items = Array.from({ length: 25 }, (_, index) => index + 1);

    expect(paginateItems(items, 2, 10)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });
});
