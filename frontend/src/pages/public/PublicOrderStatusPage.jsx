import { useCallback, useEffect, useState } from 'react';
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
  const [timeline, setTimeline] = useState([]);
  const [reviewForms, setReviewForms] = useState({});
  const [submittedReviewItemIds, setSubmittedReviewItemIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadOrder = useCallback(async () => {
    setIsRefreshing(true);
    setError('');

    try {
      const [orderResponse, statusResponse, timelineResponse] = await Promise.all([
        orderService.getOrder(orderId),
        orderService.getOrderStatus(orderId),
        orderService.getOrderTimeline(orderId).catch(() => []),
      ]);
      setOrder(orderResponse);
      setOrderStatus(statusResponse);
      setTimeline(resolveTimeline(timelineResponse, statusResponse?.status || orderResponse.status));
    } catch {
      setError('Order not found.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    return subscribeToOrder(orderId, () => {
      Promise.all([
        orderService.getOrder(orderId),
        orderService.getOrderStatus(orderId),
        orderService.getOrderTimeline(orderId).catch(() => []),
      ]).then(([orderResponse, statusResponse, timelineResponse]) => {
        setOrder(orderResponse);
        setOrderStatus(statusResponse);
        setTimeline(resolveTimeline(timelineResponse, statusResponse?.status || orderResponse.status));
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
      setSubmittedReviewItemIds((current) => (
        current.includes(orderItemId) ? current : [...current, orderItemId]
      ));
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
  const timelineSteps = resolveTimeline(timeline, currentStatus);

  return (
    <section className="public-menu">
      <div>
        <p className="eyebrow">Order #{order.id}</p>
        <h1>{formatOrderStatus(currentStatus)}</h1>
        <p>Table {order.tableNumber}</p>
        <button className="ghost-button inline" type="button" onClick={loadOrder} disabled={isRefreshing}>
          {isRefreshing ? 'Refreshing...' : 'Refresh order'}
        </button>
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
              {step.timestamp && <time dateTime={step.timestamp}>{formatTimelineTime(step.timestamp)}</time>}
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
              const isSubmitted = item.reviewed || submittedReviewItemIds.includes(item.id);
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
                  {isSubmitted && <p className="success-text">Review submitted. Thank you.</p>}
                  <label>
                    Rating
                    <select
                      value={form.rating}
                      onChange={(event) => updateReviewForm(item.id, 'rating', event.target.value)}
                      disabled={isSubmitted}
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Comment
                    <textarea
                      value={form.comment}
                      onChange={(event) => updateReviewForm(item.id, 'comment', event.target.value)}
                      rows={3}
                      disabled={isSubmitted}
                    />
                  </label>
                  <button type="submit" disabled={isSubmitted}>
                    {isSubmitted ? 'Submitted' : 'Submit review'}
                  </button>
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

function resolveTimeline(timeline, currentStatus) {
  return timeline?.length ? timeline : getTimelineSteps(currentStatus);
}

function formatTimelineTime(timestamp) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
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
