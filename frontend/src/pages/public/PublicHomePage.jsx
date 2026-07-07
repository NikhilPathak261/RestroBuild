import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as websiteService from '../../services/websiteService';

function PublicHomePage() {
  const { restaurantSlug } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadWebsite() {
      try {
        const response = await websiteService.getPublicWebsite(restaurantSlug);
        if (isMounted) {
          setRestaurant(response.data);
        }
      } catch {
        if (isMounted) {
          setError('Restaurant website not found.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadWebsite();

    return () => {
      isMounted = false;
    };
  }, [restaurantSlug]);

  if (isLoading) {
    return <section className="public-home">Loading restaurant website...</section>;
  }

  if (error) {
    return (
      <section className="public-home">
        <h1>{error}</h1>
        <p>Please check the QR code or ask the restaurant staff for help.</p>
      </section>
    );
  }

  return (
    <section
      className="public-home"
      style={{
        '--primary': restaurant.primaryColor || '#B42318',
        '--secondary': restaurant.secondaryColor || '#FFFFFF',
      }}
    >
      <p className="eyebrow">Welcome to</p>
      <h1>{restaurant.name}</h1>
      <p>{restaurant.about || restaurant.description}</p>
      <div className="public-actions">
        <a href={`/r/${restaurant.slug}/menu`}>View menu</a>
        <a href={`/r/${restaurant.slug}/contact`}>Contact</a>
      </div>
    </section>
  );
}

export default PublicHomePage;
