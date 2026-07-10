import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/PageState';
import * as orderService from '../../services/orderService';
import * as reviewService from '../../services/reviewService';
import { subscribeToOrder } from '../../services/realtimeService';
import { getApiErrorMessage } from '../../utils/apiError';

function PublicOrderStatusPage() {
  const { orderId, restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [reviewForms, setReviewForms] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      try {
        const [orderResponse, statusResponse] = await Promise.all([
          orderService.getOrder(orderId),
          orderService.getOrderStatus(orderId),
        ]);
        if (isMounted) {
          setOrder(orderResponse);
          setOrderStatus(statusResponse);
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

  useEffect(() => {
    return subscribeToOrder(orderId, () => {
      Promise.all([
        orderService.getOrder(orderId),
        orderService.getOrderStatus(orderId),
      ]).then(([orderResponse, statusResponse]) => {
        setOrder(orderResponse);
        setOrderStatus(statusResponse);
      });
    });
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
      toast.error(getApiErrorMessage(reviewError, 'Failed to submit review.'));
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading order..." />;
  }

  if (error) {
    return <ErrorState title={error} />;
  }

  const tableId = searchParams.get('tableId');
  const menuPath = tableId ? `/r/${restaurantSlug}/menu?tableId=${tableId}` : `/r/${restaurantSlug}/menu`;
  const billPath = tableId ? `/r/${restaurantSlug}/bill/${order.id}?tableId=${tableId}` : `/r/${restaurantSlug}/bill/${order.id}`;
  const canAddMoreItems = ['PENDING', 'PREPARING', 'READY'].includes(order.status);
  const currentStatus = orderStatus?.status || order.status;
  const timelineSteps = getTimelineSteps(currentStatus);

  return (
    <section className="public-menu">
      <div>
        <p className="eyebrow">Order #{order.id}</p>
        <h1>{formatOrderStatus(currentStatus)}</h1>
        <p>Table {order.tableNumber}</p>
      </div>

      <section className="list-panel">
        <div className="order-tracker-summary">
          <div>
            <span className="order-status-pill">{formatOrderStatus(currentStatus)}</span>
            <h2>{getStatusMessage(currentStatus)}</h2>
          </div>
          <div>
            <span>Estimated time</span>
            <strong>{getEstimatedTimeLabel(orderStatus?.estimatedTime, currentStatus)}</strong>
          </div>
        </div>
        <ol className="order-timeline" aria-label="Order progress">
          {timelineSteps.map((step) => (
            <li className={step.state} key={step.status}>
              <span>{step.label}</span>
              <strong>{step.description}</strong>
            </li>
          ))}
        </ol>
      </section>

      <div className="button-row">
        {canAddMoreItems && <Link className="ghost-button" to={menuPath}>Add more items</Link>}
        <Link className="ghost-button" to={billPath}>View bill</Link>
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
                  <td>Rs. {item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {order.specialInstructions && <p>Instructions: {order.specialInstructions}</p>}
        <h2>Total: Rs. {order.totalAmount}</h2>
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

const ORDER_STEPS = [
  { status: 'PENDING', label: 'Placed', description: 'The kitchen has received your order.' },
  { status: 'PREPARING', label: 'Preparing', description: 'Your food is being prepared.' },
  { status: 'READY', label: 'Ready', description: 'Your order is ready for service.' },
  { status: 'SERVED', label: 'Served', description: 'Your order has been served.' },
];

function getTimelineSteps(currentStatus) {
  if (currentStatus === 'CANCELLED') {
    return [
      { ...ORDER_STEPS[0], state: 'completed' },
      { status: 'CANCELLED', label: 'Cancelled', description: 'This order was cancelled.', state: 'current' },
    ];
  }

  const currentIndex = ORDER_STEPS.findIndex((step) => step.status === currentStatus);

  return ORDER_STEPS.map((step, index) => {
    if (index < currentIndex) {
      return { ...step, state: 'completed' };
    }

    if (index === currentIndex) {
      return { ...step, state: 'current' };
    }

    return { ...step, state: 'upcoming' };
  });
}

function getEstimatedTimeLabel(estimatedTime, status) {
  if (status === 'SERVED') {
    return 'Served';
  }

  if (status === 'CANCELLED') {
    return 'Cancelled';
  }

  if (!estimatedTime) {
    return 'Updating';
  }

  return `${estimatedTime} min`;
}

function getStatusMessage(status) {
  if (status === 'PENDING') {
    return 'Waiting for kitchen confirmation';
  }

  if (status === 'PREPARING') {
    return 'The kitchen is working on it';
  }

  if (status === 'READY') {
    return 'Almost there';
  }

  if (status === 'SERVED') {
    return 'Enjoy your meal';
  }

  return 'Order cancelled';
}

function formatOrderStatus(status) {
  return status.toLowerCase().replaceAll('_', ' ');
}

export default PublicOrderStatusPage;
