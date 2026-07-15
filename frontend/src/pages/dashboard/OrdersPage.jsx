import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import PaginationControls from '../../components/PaginationControls';
import * as orderService from '../../services/orderService';
import { subscribeToOwnerOrders } from '../../services/realtimeService';
import { getApiErrorMessage } from '../../utils/apiError';
import { DEFAULT_PAGE_SIZE, clampPage, paginateItems } from '../../utils/pagination';

const statusOptions = ['', 'PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'];

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ status: '', tableNumber: '', date: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const safePage = clampPage(page, orders.length, DEFAULT_PAGE_SIZE);
  const visibleOrders = paginateItems(orders, safePage, DEFAULT_PAGE_SIZE);

  const loadOrders = useCallback(async (nextFilters = filters) => {
    setIsLoading(true);

    try {
      const response = await orderService.getRestaurantOrders(nextFilters);
      setOrders(response);
      setPage(1);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load orders.'));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOrders(filters);
  }, [loadOrders, filters]);

  useEffect(() => {
    return subscribeToOwnerOrders(() => loadOrders(filters));
  }, [filters, loadOrders]);

  async function runAction(action, successMessage) {
    try {
      await action();
      toast.success(successMessage);
      await loadOrders(filters);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update order.'));
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
          <select
            aria-label="Filter by status"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            {statusOptions.map((option) => (
              <option key={option || 'ALL'} value={option}>
                {option || 'All statuses'}
              </option>
            ))}
          </select>
          <input
            aria-label="Filter by table number"
            min="1"
            placeholder="Table"
            type="number"
            value={filters.tableNumber}
            onChange={(event) => setFilters((current) => ({ ...current, tableNumber: event.target.value }))}
          />
          <input
            aria-label="Filter by order date"
            type="date"
            value={filters.date}
            onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
          />
          <button className="ghost-button inline" type="button" onClick={() => setFilters({ status: '', tableNumber: '', date: '' })}>
            Clear filters
          </button>
          <button className="ghost-button inline" type="button" onClick={() => loadOrders(filters)} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh orders'}
          </button>
        </div>

        {isLoading ? (
          <div className="empty-state compact">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state compact">No orders found.</div>
        ) : (
          <>
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
                  {visibleOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.tableNumber}</td>
                      <td>{order.items.map((item) => `${item.quantity}x ${item.menuItemName}`).join(', ')}</td>
                      <td>Rs. {order.totalAmount}</td>
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
            <PaginationControls
              currentPage={safePage}
              totalItems={orders.length}
              pageSize={DEFAULT_PAGE_SIZE}
              label="orders"
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </section>
  );
}

export default OrdersPage;
