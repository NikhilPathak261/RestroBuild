import { useEffect, useState } from 'react';
import * as websiteService from '../services/websiteService';

export function usePublicWebsite(restaurantSlug) {
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadWebsite() {
      setIsLoading(true);
      setError('');

      try {
        const response = await websiteService.getPublicWebsite(restaurantSlug);
        if (isMounted) {
          setRestaurant(response);
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

  return { restaurant, isLoading, error };
}
