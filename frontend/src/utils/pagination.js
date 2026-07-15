export const DEFAULT_PAGE_SIZE = 10;

export function getPageCount(totalItems, pageSize = DEFAULT_PAGE_SIZE) {
  if (totalItems <= 0) {
    return 1;
  }

  return Math.ceil(totalItems / pageSize);
}

export function clampPage(page, totalItems, pageSize = DEFAULT_PAGE_SIZE) {
  const pageCount = getPageCount(totalItems, pageSize);
  return Math.min(Math.max(page, 1), pageCount);
}

export function paginateItems(items, page, pageSize = DEFAULT_PAGE_SIZE) {
  const safePage = clampPage(page, items.length, pageSize);
  const startIndex = (safePage - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}
