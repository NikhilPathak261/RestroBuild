import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ErrorState, LoadingState } from '../../components/PageState';
import * as cartService from '../../services/cartService';
import * as categoryService from '../../services/categoryService';
import * as menuService from '../../services/menuService';
import * as orderService from '../../services/orderService';
import { getApiErrorMessage } from '../../utils/apiError';

function PublicMenuPage() {
  const { restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get('tableId');
  const tableQuery = tableId ? `?tableId=${tableId}` : '';
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [activeOrders, setActiveOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [foodType, setFoodType] = useState('');
  const [spicyLevel, setSpicyLevel] = useState('');
  const [sweetLevel, setSweetLevel] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [error, setError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const items = menuItems.filter((item) => {
      const matchesSearch = !keyword || item.name.toLowerCase().includes(keyword);
      const matchesCategory = !categoryId || String(item.categoryId) === categoryId;
      const matchesFoodType = !foodType || item.foodType === foodType;
      const matchesSpicyLevel = !spicyLevel || String(item.spicyLevel ?? 0) === spicyLevel;
      const matchesSweetLevel = !sweetLevel || String(item.sweetLevel ?? 0) === sweetLevel;
      return matchesSearch && matchesCategory && matchesFoodType && matchesSpicyLevel && matchesSweetLevel;
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
  }, [categoryId, foodType, menuItems, search, sortOrder, spicyLevel, sweetLevel]);

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

  const applyCart = useCallback((cart) => {
    const items = cart?.items ?? [];
    setCartItems(items);
    setCartSubtotal(Number(cart?.subtotal ?? 0));
    const firstInstruction = items.find((item) => item.specialInstructions)?.specialInstructions;
    setSpecialInstructions(firstInstruction ?? '');
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      try {
        const [categoryResponse, menuResponse, cartResponse] = await Promise.all([
          categoryService.getPublicCategories(restaurantSlug),
          menuService.getPublicMenu(restaurantSlug),
          cartService.getCart(),
        ]);

        if (isMounted) {
          setCategories(categoryResponse);
          setMenuItems(menuResponse);
          applyCart(cartResponse);
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
  }, [applyCart, restaurantSlug]);

  useEffect(() => {
    loadCurrentTableOrders();
  }, [loadCurrentTableOrders]);

  if (isLoading) {
    return <LoadingState label="Loading menu..." />;
  }

  if (error) {
    return <ErrorState title={error} message="Please ask the restaurant staff for help." />;
  }

  async function addToCart(item) {
    setIsUpdatingCart(true);
    try {
      const cart = await cartService.addCartItem({
        menuItemId: item.id,
        quantity: 1,
        specialInstructions: specialInstructions.trim(),
      });
      applyCart(cart);
      toast.success('Added to cart.');
    } catch (cartError) {
      toast.error(getApiErrorMessage(cartError, 'Failed to update cart.'));
    } finally {
      setIsUpdatingCart(false);
    }
  }

  async function updateCartQuantity(item, quantity) {
    setIsUpdatingCart(true);
    try {
      const cart = quantity <= 0
        ? await cartService.removeCartItem(item.id)
        : await cartService.updateCartItem(item.id, {
          quantity,
          specialInstructions: specialInstructions.trim(),
        });
      applyCart(cart);
    } catch (cartError) {
      toast.error(getApiErrorMessage(cartError, 'Failed to update cart.'));
    } finally {
      setIsUpdatingCart(false);
    }
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
      await syncCartInstructions();
      const response = await orderService.placeOrder({
        tableId: Number(tableId),
        items: cartItems.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity })),
        specialInstructions: specialInstructions.trim(),
      });
      toast.success('Order placed.');
      setCartItems([]);
      setCartSubtotal(0);
      setSpecialInstructions('');
      await cartService.clearCart();
      navigate(`/r/${restaurantSlug}/orders/${response.id}?tableId=${tableId}`);
    } catch (orderError) {
      toast.error(getApiErrorMessage(orderError, 'Failed to place order.'));
    } finally {
      setIsOrdering(false);
    }
  }

  async function syncCartInstructions() {
    const instruction = specialInstructions.trim();
    await Promise.all(cartItems.map((item) => (
      item.specialInstructions === instruction
        ? Promise.resolve()
        : cartService.updateCartItem(item.id, {
          quantity: item.quantity,
          specialInstructions: instruction,
        })
    )));
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
        <select aria-label="Filter by spicy level" value={spicyLevel} onChange={(event) => setSpicyLevel(event.target.value)}>
          <option value="">Any spice</option>
          {[0, 1, 2, 3].map((level) => (
            <option key={level} value={level}>
              Spice {level}
            </option>
          ))}
        </select>
        <select aria-label="Filter by sweet level" value={sweetLevel} onChange={(event) => setSweetLevel(event.target.value)}>
          <option value="">Any sweetness</option>
          {[0, 1, 2, 3].map((level) => (
            <option key={level} value={level}>
              Sweet {level}
            </option>
          ))}
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
          <strong>Rs. {cartSubtotal}</strong>
        </div>
        {cartItems.length === 0 ? (
          <div className="empty-state compact">Add dishes from the menu below.</div>
        ) : (
          <div className="analytics-list">
            {cartItems.map((item) => (
              <div key={item.id}>
                <span>{item.menuItemName}</span>
                <div className="table-actions">
                  <button type="button" onClick={() => updateCartQuantity(item, item.quantity - 1)} aria-label={`Remove one ${item.menuItemName}`} disabled={isUpdatingCart}>
                    -
                  </button>
                  <strong>{item.quantity}</strong>
                  <button type="button" onClick={() => updateCartQuantity(item, item.quantity + 1)} aria-label={`Add one ${item.menuItemName}`} disabled={isUpdatingCart || item.quantity >= 99}>
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
        <button type="button" onClick={placeCartOrder} disabled={isOrdering || isUpdatingCart || cartItems.length === 0}>
          {isOrdering ? 'Placing order...' : 'Place order'}
        </button>
        <Link className="ghost-button inline" to={`/r/${restaurantSlug}/cart${tableQuery}`}>
          Review cart
        </Link>
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
                <p>Spice {item.spicyLevel ?? 0}/3 - Sweet {item.sweetLevel ?? 0}/3</p>
                <strong>Rs. {item.price}</strong>
                <Link className="ghost-button inline" to={`/r/${restaurantSlug}/menu/${item.id}${tableQuery}`}>
                  View details
                </Link>
                <button type="button" onClick={() => addToCart(item)} disabled={isUpdatingCart}>
                  Add to cart
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
