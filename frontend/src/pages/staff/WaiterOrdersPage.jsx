import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as orderService from '../../services/orderService';
import { subscribeToWaiterOrders } from '../../services/realtimeService';
import { getApiErrorMessage } from '../../utils/apiError';

function WaiterOrdersPage({ status = 'READY' }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isServedView = status === 'SERVED';

  const loadOrders = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = isServedView
        ? await orderService.getWaiterServedOrders()
        : await orderService.getWaiterReadyOrders();
      setOrders(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load waiter orders.'));
    } finally {
      setIsLoading(false);
    }
  }, [isServedView]);

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
      toast.error(getApiErrorMessage(error, 'Failed to mark served.'));
    }
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Waiter</p>
        <h1>{isServedView ? 'Served orders' : 'Ready orders'}</h1>
        <button className="ghost-button inline" type="button" onClick={loadOrders} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh orders'}
        </button>
      </div>

      <section className="list-panel">
        {isLoading ? (
          <div className="empty-state compact">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state compact">No {isServedView ? 'served' : 'ready'} orders found.</div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Table</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.tableNumber}</td>
                    <td>{order.items.map((item) => `${item.quantity}x ${item.menuItemName}`).join(', ')}</td>
                    <td>Rs. {order.totalAmount}</td>
                    <td>
                      {isServedView ? (
                        <span className="order-status-pill">Served</span>
                      ) : (
                        <button type="button" onClick={() => markServed(order.id)}>
                          Mark served
                        </button>
                      )}
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
