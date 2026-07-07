import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import * as orderService from '../../services/orderService';
import * as reviewService from '../../services/reviewService';

function PublicOrderStatusPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [reviewForms, setReviewForms] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      try {
        const response = await orderService.getOrder(orderId);
        if (isMounted) {
          setOrder(response.data);
        }
      } catch {
        if (isMounted) {
          setError('Order not found.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  function updateReviewForm(orderItemId, field, value) {
    setReviewForms((current) => ({
      ...current,
      [orderItemId]: {
        rating: 5,
        comment: '',
        ...current[orderItemId],
        [field]: value,
      },
    }));
  }

  async function submitReview(orderItemId) {
    const form = reviewForms[orderItemId] || { rating: 5, comment: '' };

    try {
      await reviewService.submitReview({
        orderItemId,
        rating: Number(form.rating),
        comment: form.comment,
      });
      toast.success('Review submitted.');
    } catch (reviewError) {
      toast.error(reviewError.response?.data?.message || 'Failed to submit review.');
    }
  }

  if (isLoading) {
    return <section className="public-home">Loading order...</section>;
  }

  if (error) {
    return (
      <section className="public-home">
        <h1>{error}</h1>
      </section>
    );
  }

  return (
    <section className="public-menu">
      <div>
        <p className="eyebrow">Order #{order.id}</p>
        <h1>{order.status}</h1>
        <p>Table {order.tableNumber}</p>
      </div>

      <div className="list-panel">
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Dish</th>
                <th>Qty</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.menuItemName}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2>Total: ₹{order.totalAmount}</h2>
      </div>

      {order.status === 'SERVED' && (
        <section className="list-panel">
          <h2>Review ordered dishes</h2>
          <div className="review-form-grid">
            {order.items.map((item) => {
              const form = reviewForms[item.id] || { rating: 5, comment: '' };
              return (
                <form
                  className="review-mini-form"
                  key={item.id}
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitReview(item.id);
                  }}
                >
                  <h3>{item.menuItemName}</h3>
                  <label>
                    Rating
                    <select value={form.rating} onChange={(event) => updateReviewForm(item.id, 'rating', event.target.value)}>
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Comment
                    <textarea value={form.comment} onChange={(event) => updateReviewForm(item.id, 'comment', event.target.value)} rows={3} />
                  </label>
                  <button type="submit">Submit review</button>
                </form>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}

export default PublicOrderStatusPage;
