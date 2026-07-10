import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/PageState';
import * as orderService from '../../services/orderService';
import { subscribeToOrder } from '../../services/realtimeService';

function PublicBillPage() {
  const { orderId, restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const tableId = searchParams.get('tableId');

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
          setError('Bill not found.');
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

  if (isLoading) {
    return <LoadingState label="Loading bill..." />;
  }

  if (error) {
    return <ErrorState title={error} />;
  }

  const orderPath = tableId ? `/r/${restaurantSlug}/orders/${order.id}?tableId=${tableId}` : `/r/${restaurantSlug}/orders/${order.id}`;
  const menuPath = tableId ? `/r/${restaurantSlug}/menu?tableId=${tableId}` : `/r/${restaurantSlug}/menu`;
  const subtotal = order.items.reduce((total, item) => total + Number(item.subtotal), 0);
  const itemCount = order.items.reduce((total, item) => total + Number(item.quantity), 0);
  const currentStatus = orderStatus?.status || order.status;
  const canAddMoreItems = ['PENDING', 'PREPARING', 'READY'].includes(currentStatus);

  return (
    <section className="public-menu">
      <div>
        <p className="eyebrow">Bill Summary</p>
        <h1>Order #{order.id}</h1>
        <p>Table {order.tableNumber} - {formatOrderStatus(currentStatus)}</p>
      </div>

      <section className="list-panel bill-summary-grid">
        <article>
          <span>Status</span>
          <strong>{formatOrderStatus(currentStatus)}</strong>
          <p>{getBillStatusMessage(currentStatus)}</p>
        </article>
        <article>
          <span>Estimated time</span>
          <strong>{getEstimatedTimeLabel(orderStatus?.estimatedTime, currentStatus)}</strong>
          <p>Kitchen timing updates as the order moves.</p>
        </article>
        <article>
          <span>Items</span>
          <strong>{itemCount}</strong>
          <p>{order.items.length} dish{order.items.length === 1 ? '' : 'es'} on this bill.</p>
        </article>
      </section>

      <section className="list-panel">
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Dish</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.menuItemName}</td>
                  <td>{item.quantity}</td>
                  <td>Rs. {item.price}</td>
                  <td>Rs. {item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {order.specialInstructions && <p>Instructions: {order.specialInstructions}</p>}
        <div className="analytics-list">
          <div>
            <span>Subtotal</span>
            <strong>Rs. {subtotal}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>Rs. {order.totalAmount}</strong>
          </div>
        </div>
      </section>

      <div className="button-row">
        <Link className="ghost-button" to={orderPath}>Back to order status</Link>
        {canAddMoreItems && <Link className="ghost-button" to={menuPath}>Add more items</Link>}
        <button className="ghost-button" type="button" onClick={() => window.print()}>Print bill</button>
      </div>
    </section>
  );
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

function getBillStatusMessage(status) {
  if (status === 'SERVED') {
    return 'Ready for final payment with restaurant staff.';
  }

  if (status === 'CANCELLED') {
    return 'This order was cancelled.';
  }

  return 'This bill may update until the order is served.';
}

function formatOrderStatus(status) {
  return status.toLowerCase().replaceAll('_', ' ');
}

export default PublicBillPage;
