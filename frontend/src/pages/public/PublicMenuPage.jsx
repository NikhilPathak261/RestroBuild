import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ErrorState, LoadingState } from '../../components/PageState';
import * as categoryService from '../../services/categoryService';
import * as menuService from '../../services/menuService';
import * as orderService from '../../services/orderService';

function PublicMenuPage() {
  const { restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [orderingItemId, setOrderingItemId] = useState(null);
  const [error, setError] = useState('');
  const tableId = searchParams.get('tableId');

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchesSearch = !keyword || item.name.toLowerCase().includes(keyword);
      const matchesCategory = !categoryId || String(item.categoryId) === categoryId;
      return matchesSearch && matchesCategory;
    });
  }, [categoryId, menuItems, search]);

  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      try {
        const [categoryResponse, menuResponse] = await Promise.all([
          categoryService.getPublicCategories(restaurantSlug),
          menuService.getPublicMenu(restaurantSlug),
        ]);

        if (isMounted) {
          setCategories(categoryResponse.data);
          setMenuItems(menuResponse.data);
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

  if (isLoading) {
    return <LoadingState label="Loading menu..." />;
  }

  if (error) {
    return <ErrorState title={error} message="Please ask the restaurant staff for help." />;
  }

  async function handleQuickOrder(item) {
    if (!tableId) {
      toast.error('Please scan the table QR code before ordering.');
      return;
    }

    setOrderingItemId(item.id);

    try {
      const response = await orderService.placeOrder({
        tableId: Number(tableId),
        items: [{ menuItemId: item.id, quantity: 1 }],
      });
      toast.success('Order placed.');
      navigate(`/r/${restaurantSlug}/orders/${response.data.id}?tableId=${tableId}`);
    } catch (orderError) {
      toast.error(orderError.response?.data?.message || 'Failed to place order.');
    } finally {
      setOrderingItemId(null);
    }
  }

  return (
    <section className="public-menu">
      <div>
        <p className="eyebrow">Menu</p>
        <h1>Choose your dishes</h1>
      </div>

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
      </div>

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
                <strong>₹{item.price}</strong>
                <button type="button" onClick={() => handleQuickOrder(item)} disabled={orderingItemId === item.id}>
                  {orderingItemId === item.id ? 'Ordering...' : 'Order 1'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default PublicMenuPage;
