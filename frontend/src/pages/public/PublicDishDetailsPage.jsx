import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/PageState';
import * as menuService from '../../services/menuService';
import * as reviewService from '../../services/reviewService';

function PublicDishDetailsPage() {
  const { restaurantSlug, menuItemId } = useParams();
  const [searchParams] = useSearchParams();
  const [menuItem, setMenuItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const tableId = searchParams.get('tableId');
  const menuPath = tableId ? `/r/${restaurantSlug}/menu?tableId=${tableId}` : `/r/${restaurantSlug}/menu`;

  useEffect(() => {
    let isMounted = true;

    async function loadDish() {
      try {
        const [itemResponse, reviewResponse] = await Promise.all([
          menuService.getPublicMenuItem(restaurantSlug, menuItemId),
          reviewService.getPublicMenuItemReviews(menuItemId),
        ]);

        if (isMounted) {
          setMenuItem(itemResponse);
          setReviews(reviewResponse);
        }
      } catch {
        if (isMounted) {
          setError('Dish not found.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDish();

    return () => {
      isMounted = false;
    };
  }, [menuItemId, restaurantSlug]);

  if (isLoading) {
    return <LoadingState label="Loading dish..." />;
  }

  if (error) {
    return <ErrorState title={error} message="Please return to the menu and choose another dish." />;
  }

  return (
    <section className="public-menu">
      <div>
        <p className="eyebrow">{menuItem.categoryName}</p>
        <h1>{menuItem.name}</h1>
        <p>{menuItem.description}</p>
      </div>

      <section className="list-panel dish-detail-grid">
        {menuItem.imageUrl && <img src={menuItem.imageUrl} alt={menuItem.name} />}
        <div className="analytics-list">
          <div>
            <span>Price</span>
            <strong>Rs. {menuItem.price}</strong>
          </div>
          <div>
            <span>Food type</span>
            <strong>{formatFoodType(menuItem.foodType)}</strong>
          </div>
          <div>
            <span>Preparation time</span>
            <strong>{menuItem.preparationTime ?? 0} min</strong>
          </div>
          <div>
            <span>Spicy level</span>
            <strong>{menuItem.spicyLevel ?? 0}/3</strong>
          </div>
          <div>
            <span>Sweet level</span>
            <strong>{menuItem.sweetLevel ?? 0}/3</strong>
          </div>
        </div>
      </section>

      <section className="list-panel">
        <h2>Customer Reviews</h2>
        {reviews.length === 0 ? (
          <div className="empty-state compact">No reviews yet.</div>
        ) : (
          <div className="review-form-grid">
            {reviews.map((review) => (
              <article className="review-mini-form" key={review.id}>
                <h3>{review.rating} star</h3>
                <p>{review.comment}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <Link className="ghost-button" to={menuPath}>Back to menu</Link>
    </section>
  );
}

function formatFoodType(foodType) {
  if (foodType === 'NON_VEG') {
    return 'Non-veg';
  }

  return foodType === 'VEG' ? 'Veg' : 'Food';
}

export default PublicDishDetailsPage;
