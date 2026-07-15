import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ErrorState, LoadingState } from '../../components/PageState';
import * as cartService from '../../services/cartService';
import * as orderService from '../../services/orderService';
import { getApiErrorMessage } from '../../utils/apiError';

function PublicCartPage() {
  const { restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableId = searchParams.get('tableId');
  const tableQuery = tableId ? `?tableId=${tableId}` : '';
  const [cartItems, setCartItems] = useState([]);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [isUpdatingCart, setIsUpdatingCart] = useState(false);

  const applyCart = useCallback((cart) => {
    const items = cart?.items ?? [];
    setCartItems(items);
    setCartSubtotal(Number(cart?.subtotal ?? 0));
    const firstInstruction = items.find((item) => item.specialInstructions)?.specialInstructions;
    setSpecialInstructions(firstInstruction ?? '');
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadCart() {
      try {
        const cart = await cartService.getCart();
        if (isMounted) {
          applyCart(cart);
        }
      } catch {
        if (isMounted) {
          setError('Cart is not available right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCart();

    return () => {
      isMounted = false;
    };
  }, [applyCart]);

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

  function updateSpecialInstructions(value) {
    setSpecialInstructions(value);
  }

  async function clearCart() {
    setIsUpdatingCart(true);
    try {
      await cartService.clearCart();
      setCartItems([]);
      setCartSubtotal(0);
      setSpecialInstructions('');
    } catch (cartError) {
      toast.error(getApiErrorMessage(cartError, 'Failed to clear cart.'));
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
      await cartService.clearCart();
      setCartItems([]);
      setCartSubtotal(0);
      setSpecialInstructions('');
      navigate(`/r/${restaurantSlug}/orders/${response.id}?tableId=${tableId}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to place order.'));
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

  if (isLoading) {
    return <LoadingState label="Loading cart..." />;
  }

  if (error) {
    return <ErrorState title={error} message="Please return to the menu and try again." />;
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
          <strong>Rs. {cartSubtotal}</strong>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-state compact">Your cart is empty.</div>
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
            onChange={(event) => updateSpecialInstructions(event.target.value)}
          />
        </label>

        <div className="button-row">
          <button type="button" onClick={placeCartOrder} disabled={isOrdering || isUpdatingCart || cartItems.length === 0}>
            {isOrdering ? 'Placing order...' : 'Place order'}
          </button>
          <button type="button" className="ghost-button inline" onClick={clearCart} disabled={isUpdatingCart || (cartItems.length === 0 && !specialInstructions)}>
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
