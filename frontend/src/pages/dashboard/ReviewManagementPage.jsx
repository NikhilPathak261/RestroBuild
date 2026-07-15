import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PaginationControls from '../../components/PaginationControls';
import * as reviewService from '../../services/reviewService';
import { getApiErrorMessage } from '../../utils/apiError';
import { DEFAULT_PAGE_SIZE, clampPage, paginateItems } from '../../utils/pagination';

function ReviewManagementPage() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const safePage = clampPage(page, reviews.length, DEFAULT_PAGE_SIZE);
  const visibleReviews = paginateItems(reviews, safePage, DEFAULT_PAGE_SIZE);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await reviewService.getReviews(rating ? { rating } : {});
      setReviews(response);
      setPage(1);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load reviews.'));
    } finally {
      setIsLoading(false);
    }
  }, [rating]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  async function runAction(action, successMessage) {
    try {
      await action();
      toast.success(successMessage);
      await loadReviews();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update review.'));
    }
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Reviews</p>
        <h1>Moderate customer reviews</h1>
      </div>

      <section className="list-panel">
        <div className="list-header">
          <h2>Review List</h2>
          <select
            aria-label="Filter by rating"
            value={rating}
            onChange={(event) => {
              setRating(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star
              </option>
            ))}
          </select>
          <button className="ghost-button inline" type="button" onClick={loadReviews} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh reviews'}
          </button>
        </div>

        {isLoading ? (
          <div className="empty-state compact">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="empty-state compact">No reviews found.</div>
        ) : (
          <>
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Dish</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleReviews.map((review) => (
                    <tr key={review.id}>
                      <td>{review.menuItemName}</td>
                      <td>{review.rating}</td>
                      <td>{review.comment || '-'}</td>
                      <td>{review.visible ? 'Visible' : 'Hidden'}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            onClick={() =>
                              runAction(
                                () => (review.visible ? reviewService.hideReview(review.id) : reviewService.showReview(review.id)),
                                review.visible ? 'Review hidden.' : 'Review shown.',
                              )
                            }
                          >
                            {review.visible ? 'Hide' : 'Show'}
                          </button>
                          <button className="danger-button" type="button" onClick={() => runAction(() => reviewService.deleteReview(review.id), 'Review deleted.')}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={safePage}
              totalItems={reviews.length}
              pageSize={DEFAULT_PAGE_SIZE}
              label="reviews"
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </section>
  );
}

export default ReviewManagementPage;
