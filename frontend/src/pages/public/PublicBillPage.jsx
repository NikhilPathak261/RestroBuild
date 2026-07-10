import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/PageState';
import * as orderService from '../../services/orderService';
import { subscribeToOrder } from '../../services/realtimeService';

function PublicBillPage() {
  const { orderId, restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [tableBill, setTableBill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const tableId = searchParams.get('tableId');

  const loadOrder = useCallback(async () => {
    setIsRefreshing(true);
    setError('');

    try {
      const [orderResponse, statusResponse, billResponse] = await Promise.all([
        orderService.getOrder(orderId),
        orderService.getOrderStatus(orderId),
        tableId ? orderService.getTableBill(tableId).catch(() => null) : Promise.resolve(null),
      ]);
      setOrder(orderResponse);
      setOrderStatus(statusResponse);
      setTableBill(billResponse);
    } catch {
      setError('Bill not found.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orderId, tableId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    return subscribeToOrder(orderId, () => {
      Promise.all([
        orderService.getOrder(orderId),
        orderService.getOrderStatus(orderId),
        tableId ? orderService.getTableBill(tableId).catch(() => null) : Promise.resolve(null),
      ]).then(([orderResponse, statusResponse, billResponse]) => {
        setOrder(orderResponse);
        setOrderStatus(statusResponse);
        setTableBill(billResponse);
      });
    });
  }, [orderId, tableId]);

  if (isLoading) {
    return <LoadingState label="Loading bill..." />;
  }

  if (error) {
    return <ErrorState title={error} />;
  }

  const orderPath = tableId ? `/r/${restaurantSlug}/orders/${order.id}?tableId=${tableId}` : `/r/${restaurantSlug}/orders/${order.id}`;
  const menuPath = tableId ? `/r/${restaurantSlug}/menu?tableId=${tableId}` : `/r/${restaurantSlug}/menu`;
  const hasTableBill = Boolean(tableBill?.items?.length);
  const billItems = hasTableBill ? tableBill.items : order.items.map((item) => ({
    ...item,
    orderId: order.id,
    orderStatus: order.status,
    orderItemId: item.id,
  }));
  const subtotal = hasTableBill ? Number(tableBill.subtotal) : billItems.reduce((total, item) => total + Number(item.subtotal), 0);
  const totalAmount = hasTableBill ? Number(tableBill.totalAmount) : Number(order.totalAmount);
  const itemCount = hasTableBill ? tableBill.itemCount : billItems.reduce((total, item) => total + Number(item.quantity), 0);
  const orderCount = hasTableBill ? tableBill.orderCount : 1;
  const tableNumber = hasTableBill ? tableBill.tableNumber : order.tableNumber;
  const currentStatus = orderStatus?.status || order.status;
  const canAddMoreItems = ['PENDING', 'PREPARING', 'READY'].includes(currentStatus);

  return (
    <section className="public-menu">
      <div>
        <p className="eyebrow">Bill Summary</p>
        <h1>{hasTableBill ? `Table ${tableNumber} bill` : `Order #${order.id}`}</h1>
        <p>{hasTableBill ? `${orderCount} order${orderCount === 1 ? '' : 's'} in this table bill` : `Table ${tableNumber} - ${formatOrderStatus(currentStatus)}`}</p>
        <button className="ghost-button inline" type="button" onClick={loadOrder} disabled={isRefreshing}>
          {isRefreshing ? 'Refreshing...' : 'Refresh bill'}
        </button>
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
          <p>{billItems.length} line item{billItems.length === 1 ? '' : 's'} on this bill.</p>
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
              {billItems.map((item) => (
                <tr key={`${item.orderId}-${item.orderItemId || item.id}`}>
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
            <strong>Rs. {totalAmount}</strong>
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
