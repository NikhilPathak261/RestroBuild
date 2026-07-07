import { useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/PageState';
import { usePublicWebsite } from '../../hooks/usePublicWebsite';

function PublicAboutPage() {
  const { restaurantSlug } = useParams();
  const { restaurant, isLoading, error } = usePublicWebsite(restaurantSlug);

  if (isLoading) {
    return <LoadingState label="Loading restaurant details..." />;
  }

  if (error) {
    return <ErrorState title={error} message="Please check the QR code or ask the restaurant staff for help." />;
  }

  return (
    <section
      className="public-content"
      style={{
        '--primary': restaurant.primaryColor || '#B42318',
        '--secondary': restaurant.secondaryColor || '#FFFFFF',
      }}
    >
      <p className="eyebrow">About</p>
      <h1>{restaurant.name}</h1>
      <p>{restaurant.about || restaurant.description || 'This restaurant has not added an about section yet.'}</p>
    </section>
  );
}

export default PublicAboutPage;
