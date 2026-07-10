import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ErrorState, LoadingState } from '../../components/PageState';
import * as categoryService from '../../services/categoryService';
import * as menuService from '../../services/menuService';
import * as orderService from '../../services/orderService';
import { getApiErrorMessage } from '../../utils/apiError';

function PublicMenuPage() {
  const { restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [foodType, setFoodType] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [error, setError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const tableId = searchParams.get('tableId');
  const tableQuery = tableId ? `?tableId=${tableId}` : '';

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const items = menuItems.filter((item) => {
      const matchesSearch = !keyword || item.name.toLowerCase().includes(keyword);
      const matchesCategory = !categoryId || String(item.categoryId) === categoryId;
      const matchesFoodType = !foodType || item.foodType === foodType;
      return matchesSearch && matchesCategory && matchesFoodType;
    });

    return [...items].sort((first, second) => {
      if (sortOrder === 'PRICE_ASC') {
        return Number(first.price) - Number(second.price);
      }

      if (sortOrder === 'PRICE_DESC') {
        return Number(second.price) - Number(first.price);
      }

      return first.name.localeCompare(second.name);
    });
  }, [categoryId, foodType, menuItems, search, sortOrder]);

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0),
    [cartItems],
  );

  const loadCurrentTableOrders = useCallback(async () => {
    if (!tableId) {
      setActiveOrders([]);
      setOrdersError('');
      setIsLoadingOrders(false);
      return;
    }

    setIsLoadingOrders(true);
    setOrdersError('');

    try {
      const response = await orderService.getCurrentTableOrders(Number(tableId));
      setActiveOrders(response);
    } catch {
      setOrdersError('Could not load active table orders.');
      setActiveOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [tableId]);

  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      try {
        const [categoryResponse, menuResponse] = await Promise.all([
          categoryService.getPublicCategories(restaurantSlug),
          menuService.getPublicMenu(restaurantSlug),
        ]);

        if (isMounted) {
          setCategories(categoryResponse);
          setMenuItems(menuResponse);
        }
      } catch {
        if (isMounted) {
          setError('Menu is not available right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMenu();

    return () => {
      isMounted = false;
    };
  }, [restaurantSlug]);

  useEffect(() => {
    loadCurrentTableOrders();
  }, [loadCurrentTableOrders]);

  if (isLoading) {
    return <LoadingState label="Loading menu..." />;
  }

  if (error) {
    return <ErrorState title={error} message="Please ask the restaurant staff for help." />;
  }

  function addToCart(item) {
    setCartItems((current) => {
      const existingItem = current.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return current.map((cartItem) => (
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        ));
      }

      return [...current, { ...item, quantity: 1 }];
    });
  }

  function updateCartQuantity(itemId, quantity) {
    if (quantity <= 0) {
      setCartItems((current) => current.filter((item) => item.id !== itemId));
      return;
    }

    setCartItems((current) => current.map((item) => (
      item.id === itemId ? { ...item, quantity } : item
    )));
  }

  async function placeCartOrder() {
    if (!tableId) {
      toast.error('Please scan the table QR code before ordering.');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Add at least one dish before placing an order.');
      return;
    }

    setIsOrdering(true);

    try {
      const response = await orderService.placeOrder({
        tableId: Number(tableId),
        items: cartItems.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
        specialInstructions: specialInstructions.trim(),
      });
      toast.success('Order placed.');
      setCartItems([]);
      setSpecialInstructions('');
      navigate(`/r/${restaurantSlug}/orders/${response.id}?tableId=${tableId}`);
    } catch (orderError) {
      toast.error(getApiErrorMessage(orderError, 'Failed to place order.'));
    } finally {
      setIsOrdering(false);
    }
  }

  return (
    <section className="public-menu">
      <div>
        <p className="eyebrow">Menu</p>
        <h1>Choose your dishes</h1>
      </div>

      {tableId && (
        <section className="list-panel">
          <div className="list-header">
            <h2>Active table orders</h2>
            <button
              className="ghost-button inline"
              type="button"
              onClick={loadCurrentTableOrders}
              disabled={isLoadingOrders}
            >
              {isLoadingOrders ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          {ordersError && <div className="empty-state compact">{ordersError}</div>}
          {!ordersError && isLoadingOrders && activeOrders.length === 0 && (
            <div className="empty-state compact">Loading active orders...</div>
          )}
          {!ordersError && !isLoadingOrders && activeOrders.length === 0 && (
            <div className="empty-state compact">No active orders for this table yet.</div>
          )}
          {activeOrders.length > 0 && (
            <div className="active-order-grid">
              {activeOrders.map((order) => (
                <article className="active-order-card" key={order.id}>
                  <div>
                    <span className="order-status-pill">{formatOrderStatus(order.status)}</span>
                    <h3>Order #{order.id}</h3>
                    <p>
                      {order.items.length} item{order.items.length === 1 ? '' : 's'} - Rs. {order.totalAmount}
                    </p>
                  </div>
                  <div className="table-actions">
                    <Link className="ghost-button inline" to={`/r/${restaurantSlug}/orders/${order.id}${tableQuery}`}>
                      Track
                    </Link>
                    <Link className="ghost-button inline" to={`/r/${restaurantSlug}/bill/${order.id}${tableQuery}`}>
                      Bill
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="public-menu-filters">
        <input
          aria-label="Search menu"
          placeholder="Search dishes"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select aria-label="Filter by category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select aria-label="Filter by food type" value={foodType} onChange={(event) => setFoodType(event.target.value)}>
          <option value="">All food types</option>
          <option value="VEG">Veg</option>
          <option value="NON_VEG">Non-veg</option>
        </select>
        <select aria-label="Sort menu" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
          <option value="">Sort by name</option>
          <option value="PRICE_ASC">Price low to high</option>
          <option value="PRICE_DESC">Price high to low</option>
        </select>
      </div>

      <section className="list-panel">
        <div className="list-header">
          <h2>Your Order</h2>
          <strong>Rs. {cartTotal}</strong>
        </div>
        {cartItems.length === 0 ? (
          <div className="empty-state compact">Add dishes from the menu below.</div>
        ) : (
          <div className="analytics-list">
            {cartItems.map((item) => (
              <div key={item.id}>
                <span>{item.name}</span>
                <div className="table-actions">
                  <button type="button" onClick={() => updateCartQuantity(item.id, item.quantity - 1)} aria-label={`Remove one ${item.name}`}>
                    -
                  </button>
                  <strong>{item.quantity}</strong>
                  <button type="button" onClick={() => updateCartQuantity(item.id, item.quantity + 1)} aria-label={`Add one ${item.name}`}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <label>
          Special instructions
          <textarea
            maxLength={500}
            rows={3}
            placeholder="Less spicy, no onion, serve together..."
            value={specialInstructions}
            onChange={(event) => setSpecialInstructions(event.target.value)}
          />
        </label>
        <button type="button" onClick={placeCartOrder} disabled={isOrdering || cartItems.length === 0}>
          {isOrdering ? 'Placing order...' : 'Place order'}
        </button>
      </section>

      {filteredItems.length === 0 ? (
        <div className="empty-state">No dishes found.</div>
      ) : (
        <div className="menu-card-grid">
          {filteredItems.map((item) => (
            <article className="menu-card" key={item.id}>
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} />}
              <div>
                <span>{item.categoryName}</span>
                <h2>{item.name}</h2>
                <p>{item.description}</p>
                <p>{formatFoodType(item.foodType)} - {item.preparationTime ?? 0} min</p>
                <strong>Rs. {item.price}</strong>
                <Link className="ghost-button inline" to={`/r/${restaurantSlug}/menu/${item.id}${tableQuery}`}>
                  View details
                </Link>
                <button type="button" onClick={() => addToCart(item)}>
                  Add to order
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatFoodType(foodType) {
  if (foodType === 'NON_VEG') {
    return 'Non-veg';
  }

  return foodType === 'VEG' ? 'Veg' : 'Food';
}

function formatOrderStatus(status) {
  return status.toLowerCase().replaceAll('_', ' ');
}

export default PublicMenuPage;
