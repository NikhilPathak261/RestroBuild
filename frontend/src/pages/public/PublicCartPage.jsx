import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as orderService from '../../services/orderService';
import { getApiErrorMessage } from '../../utils/apiError';
import { clearPublicCart, loadPublicCart, savePublicCart } from '../../utils/publicCart';

function PublicCartPage() {
  const { restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get('tableId');
  const tableQuery = tableId ? `?tableId=${tableId}` : '';
  const storedCart = loadPublicCart(restaurantSlug, tableId);
  const [cartItems, setCartItems] = useState(storedCart.items);
  const [specialInstructions, setSpecialInstructions] = useState(storedCart.specialInstructions);
  const [isOrdering, setIsOrdering] = useState(false);

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0),
    [cartItems],
  );

  function persistCart(nextItems, nextInstructions = specialInstructions) {
    setCartItems(nextItems);
    setSpecialInstructions(nextInstructions);
    savePublicCart(restaurantSlug, tableId, { items: nextItems, specialInstructions: nextInstructions });
  }

  function updateCartQuantity(itemId, quantity) {
    const nextItems = quantity <= 0
      ? cartItems.filter((item) => item.id !== itemId)
      : cartItems.map((item) => (item.id === itemId ? { ...item, quantity } : item));
    persistCart(nextItems);
  }

  function updateSpecialInstructions(value) {
    persistCart(cartItems, value);
  }

  function clearCart() {
    clearPublicCart(restaurantSlug, tableId);
    setCartItems([]);
    setSpecialInstructions('');
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
      clearPublicCart(restaurantSlug, tableId);
      setCartItems([]);
      setSpecialInstructions('');
      navigate(`/r/${restaurantSlug}/orders/${response.id}?tableId=${tableId}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to place order.'));
    } finally {
      setIsOrdering(false);
    }
  }

  return (
    <section className="public-menu">
      <div>
        <p className="eyebrow">Cart</p>
        <h1>Your order</h1>
        {tableId ? <p>Table QR detected.</p> : <p>Please scan a table QR before placing an order.</p>}
      </div>

      <section className="list-panel">
        <div className="list-header">
          <h2>Cart Items</h2>
          <strong>Rs. {cartTotal}</strong>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-state compact">Your cart is empty.</div>
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
            onChange={(event) => updateSpecialInstructions(event.target.value)}
          />
        </label>

        <div className="button-row">
          <button type="button" onClick={placeCartOrder} disabled={isOrdering || cartItems.length === 0}>
            {isOrdering ? 'Placing order...' : 'Place order'}
          </button>
          <button type="button" className="ghost-button inline" onClick={clearCart} disabled={cartItems.length === 0 && !specialInstructions}>
            Clear cart
          </button>
          <Link className="ghost-button inline" to={`/r/${restaurantSlug}/menu${tableQuery}`}>
            Back to menu
          </Link>
        </div>
      </section>
    </section>
  );
}

export default PublicCartPage;
