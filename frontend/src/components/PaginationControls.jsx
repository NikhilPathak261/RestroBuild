import { clampPage, getPageCount } from '../utils/pagination';

function PaginationControls({ currentPage, totalItems, pageSize, onPageChange, label = 'items' }) {
  const pageCount = getPageCount(totalItems, pageSize);
  const safePage = clampPage(currentPage, totalItems, pageSize);
  const start = totalItems === 0 ? 0 : ((safePage - 1) * pageSize) + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <nav className="pagination-controls" aria-label={`${label} pagination`}>
      <span>
        Showing {start}-{end} of {totalItems} {label}
      </span>
      <div>
        <button
          className="ghost-button inline"
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 1}
        >
          Previous
        </button>
        <strong>Page {safePage} of {pageCount}</strong>
        <button
          className="ghost-button inline"
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage === pageCount}
        >
          Next
        </button>
      </div>
    </nav>
  );
}

export default PaginationControls;
