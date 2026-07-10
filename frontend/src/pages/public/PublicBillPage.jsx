import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/PageState';
import * as orderService from '../../services/orderService';
import { subscribeToOrder } from '../../services/realtimeService';

function PublicBillPage() {
  const { orderId, restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const tableId = searchParams.get('tableId');

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      try {
        const response = await orderService.getOrder(orderId);
        if (isMounted) {
          setOrder(response);
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
      orderService.getOrder(orderId).then((response) => setOrder(response));
    });
  }, [orderId]);

  if (isLoading) {
    return <LoadingState label="Loading bill..." />;
  }

  if (error) {
    return <ErrorState title={error} />;
  }

  const orderPath = tableId ? `/r/${restaurantSlug}/orders/${order.id}?tableId=${tableId}` : `/r/${restaurantSlug}/orders/${order.id}`;
  const subtotal = order.items.reduce((total, item) => total + Number(item.subtotal), 0);

  return (
    <section className="public-menu">
      <div>
        <p className="eyebrow">Bill Summary</p>
        <h1>Order #{order.id}</h1>
        <p>Table {order.tableNumber} - {order.status}</p>
      </div>

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

      <Link className="ghost-button" to={orderPath}>Back to order status</Link>
    </section>
  );
}

export default PublicBillPage;
