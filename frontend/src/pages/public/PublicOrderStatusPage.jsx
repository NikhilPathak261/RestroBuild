import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as orderService from '../../services/orderService';

function PublicOrderStatusPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
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
    </section>
  );
}

export default PublicOrderStatusPage;
