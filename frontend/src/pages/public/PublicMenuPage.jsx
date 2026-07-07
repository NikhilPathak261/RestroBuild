import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as categoryService from '../../services/categoryService';
import * as menuService from '../../services/menuService';

function PublicMenuPage() {
  const { restaurantSlug } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
    return <section className="public-home">Loading menu...</section>;
  }

  if (error) {
    return (
      <section className="public-home">
        <h1>{error}</h1>
        <p>Please ask the restaurant staff for help.</p>
      </section>
    );
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
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default PublicMenuPage;
