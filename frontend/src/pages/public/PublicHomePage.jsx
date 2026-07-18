import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/PageState';
import { usePublicWebsite } from '../../hooks/usePublicWebsite';
import * as tableService from '../../services/tableService';

function PublicHomePage() {
  const { restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const { restaurant, isLoading, error } = usePublicWebsite(restaurantSlug);
  const [qrContext, setQrContext] = useState(null);
  const [qrError, setQrError] = useState('');
  const [isQrLoading, setIsQrLoading] = useState(false);
  const tableId = searchParams.get('tableId');
  const tableQuery = tableId ? `?tableId=${tableId}` : '';

  useEffect(() => {
    if (!tableId) {
      setQrContext(null);
      setQrError('');
      setIsQrLoading(false);
      return;
    }

    let isMounted = true;

    async function validateQr() {
      setIsQrLoading(true);
      setQrError('');

      try {
        const response = await tableService.validateQr(tableId);
        if (!isMounted) {
          return;
        }

        if (response.restaurantSlug !== restaurantSlug) {
          setQrError('This table QR does not belong to this restaurant.');
          setQrContext(null);
          return;
        }

        setQrContext(response);
      } catch {
        if (isMounted) {
          setQrError('Table QR code is not valid.');
          setQrContext(null);
        }
      } finally {
        if (isMounted) {
          setIsQrLoading(false);
        }
      }
    }

    validateQr();

    return () => {
      isMounted = false;
    };
  }, [restaurantSlug, tableId]);

  if (isLoading || isQrLoading) {
    return <LoadingState label="Loading restaurant website..." />;
  }

  if (error || qrError) {
    return <ErrorState title={error || qrError} message="Please check the QR code or ask the restaurant staff for help." />;
  }

  return (
    <section
      className="public-home"
      style={{
        '--primary': restaurant.primaryColor || '#B42318',
        '--secondary': restaurant.secondaryColor || '#FFFFFF',
      }}
    >
      {restaurant.coverImageUrl && (
        <img className="public-cover" src={restaurant.coverImageUrl} alt={`${restaurant.name} cover`} />
      )}
      <div className="public-home-content">
        <div className="public-hero-chip-row" aria-label="Restaurant service highlights">
          <span>QR table ordering</span>
          <span>Live kitchen updates</span>
          <span>Fresh checkout</span>
        </div>
        <div className="public-brand-row">
          {restaurant.logoUrl && (
            <img className="public-logo" src={restaurant.logoUrl} alt={`${restaurant.name} logo`} />
          )}
          <div>
            <p className="eyebrow">Welcome to</p>
            <h1>{restaurant.name}</h1>
          </div>
        </div>
        <p>{restaurant.about || restaurant.description}</p>
        {qrContext && (
          <div className="table-context-card">
            <span>Your table</span>
            <strong>Table {qrContext.tableNumber}</strong>
            <p>Your orders will be linked to this table.</p>
          </div>
        )}
        <div className="public-actions">
          <Link to={`/r/${restaurant.slug}/menu${tableQuery}`}>View menu</Link>
          <Link to={`/r/${restaurant.slug}/contact${tableQuery}`}>Contact</Link>
        </div>
        <div className="public-service-strip" aria-label="Ordering steps">
          <span>Scan</span>
          <span>Choose</span>
          <span>Track</span>
          <span>Enjoy</span>
        </div>
      </div>
    </section>
  );
}

export default PublicHomePage;
