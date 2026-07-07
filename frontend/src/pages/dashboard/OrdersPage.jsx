import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as orderService from '../../services/orderService';
import { subscribeToOwnerOrders } from '../../services/realtimeService';

const statusOptions = ['', 'PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'];

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async (nextStatus = status) => {
    setIsLoading(true);

    try {
      const response = await orderService.getRestaurantOrders(nextStatus);
      setOrders(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadOrders(status);
  }, [loadOrders, status]);

  useEffect(() => {
    return subscribeToOwnerOrders(() => loadOrders(status));
  }, [loadOrders, status]);

  async function runAction(action, successMessage) {
    try {
      await action();
      toast.success(successMessage);
      await loadOrders(status);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order.');
    }
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Orders</p>
        <h1>Track restaurant orders</h1>
      </div>

      <section className="list-panel">
        <div className="list-header">
          <h2>Order List</h2>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {statusOptions.map((option) => (
              <option key={option || 'ALL'} value={option}>
                {option || 'All statuses'}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="empty-state compact">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state compact">No orders found.</div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Table</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.tableNumber}</td>
                    <td>{order.items.map((item) => `${item.quantity}x ${item.menuItemName}`).join(', ')}</td>
                    <td>₹{order.totalAmount}</td>
                    <td>{order.status}</td>
                    <td>
                      <div className="table-actions">
                        {order.status === 'PENDING' && (
                          <>
                            <button type="button" onClick={() => runAction(() => orderService.markPreparing(order.id), 'Order marked preparing.')}>
                              Prepare
                            </button>
                            <button className="danger-button" type="button" onClick={() => runAction(() => orderService.cancelOrder(order.id), 'Order cancelled.')}>
                              Cancel
                            </button>
                          </>
                        )}
                        {order.status === 'PREPARING' && (
                          <button type="button" onClick={() => runAction(() => orderService.markReady(order.id), 'Order marked ready.')}>
                            Ready
                          </button>
                        )}
                        {order.status === 'READY' && (
                          <button type="button" onClick={() => runAction(() => orderService.markServed(order.id), 'Order marked served.')}>
                            Served
                          </button>
                        )}
                      </div>
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

export default OrdersPage;
