import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as orderService from '../../services/orderService';
import { subscribeToWaiterOrders } from '../../services/realtimeService';

function WaiterOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await orderService.getWaiterReadyOrders();
      setOrders(response);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load waiter orders.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    return subscribeToWaiterOrders(() => loadOrders());
  }, [loadOrders]);

  async function markServed(orderId) {
    try {
      await orderService.markServed(orderId);
      toast.success('Order marked served.');
      await loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark served.');
    }
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Waiter</p>
        <h1>Ready orders</h1>
      </div>

      <section className="list-panel">
        {isLoading ? (
          <div className="empty-state compact">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state compact">No ready orders found.</div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Table</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.tableNumber}</td>
                    <td>{order.items.map((item) => `${item.quantity}x ${item.menuItemName}`).join(', ')}</td>
                    <td>
                      <button type="button" onClick={() => markServed(order.id)}>
                        Mark served
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default WaiterOrdersPage;
