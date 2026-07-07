import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as orderService from '../../services/orderService';

const loaders = {
  PENDING: orderService.getKitchenPendingOrders,
  PREPARING: orderService.getKitchenPreparingOrders,
  READY: orderService.getKitchenReadyOrders,
};

function KitchenOrdersPage({ status }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await loaders[status]();
      setOrders(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load kitchen orders.');
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function runAction(action, successMessage) {
    try {
      await action();
      toast.success(successMessage);
      await loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order.');
    }
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Kitchen</p>
        <h1>{status} orders</h1>
      </div>

      <section className="list-panel">
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
                      <div className="table-actions">
                        {status === 'PENDING' && (
                          <button type="button" onClick={() => runAction(() => orderService.markPreparing(order.id), 'Order marked preparing.')}>
                            Prepare
                          </button>
                        )}
                        {status === 'PREPARING' && (
                          <button type="button" onClick={() => runAction(() => orderService.markReady(order.id), 'Order marked ready.')}>
                            Ready
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

export default KitchenOrdersPage;
