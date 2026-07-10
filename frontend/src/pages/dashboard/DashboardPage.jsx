import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as analyticsService from '../../services/analyticsService';
import * as orderService from '../../services/orderService';
import { subscribeToOwnerOrders } from '../../services/realtimeService';
import { getApiErrorMessage } from '../../utils/apiError';

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);

    try {
      const [summaryResponse, topItemsResponse, ordersResponse] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getTopMenuItems(),
        orderService.getRestaurantOrders(),
      ]);

      setSummary(summaryResponse);
      setTopItems(topItemsResponse);
      setRecentOrders(ordersResponse.slice(0, 5));
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load dashboard.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    return subscribeToOwnerOrders(loadDashboard);
  }, [loadDashboard]);

  const metrics = [
    { label: "Today's Orders", value: summary?.todayOrders ?? 0 },
    { label: "Today's Revenue", value: `Rs. ${summary?.todayRevenue ?? 0}` },
    { label: 'Average Rating', value: summary?.averageRating ?? '-' },
    { label: 'Popular Dish', value: topItems[0]?.menuItemName ?? '-' },
  ];

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Owner Dashboard</p>
        <h1>Business overview</h1>
        <button className="ghost-button inline" type="button" onClick={loadDashboard} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh dashboard'}
        </button>
      </div>

      {isLoading && <section className="empty-state compact">Loading dashboard...</section>}

      <div className="metric-grid">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <section className="list-panel">
        <h2>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div className="empty-state compact">
            <h3>No recent orders yet</h3>
            <p>Orders will appear here once customers start placing them from table QR codes.</p>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Table</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.tableNumber}</td>
                    <td>Rs. {order.totalAmount}</td>
                    <td>{order.status}</td>
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

export default DashboardPage;
