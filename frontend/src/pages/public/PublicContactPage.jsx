import { useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/PageState';
import { usePublicWebsite } from '../../hooks/usePublicWebsite';

function PublicContactPage() {
  const { restaurantSlug } = useParams();
  const { restaurant, isLoading, error } = usePublicWebsite(restaurantSlug);

  if (isLoading) {
    return <LoadingState label="Loading contact details..." />;
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
      <p className="eyebrow">Contact</p>
      <h1>Visit {restaurant.name}</h1>
      <div className="contact-grid">
        <article>
          <span>Address</span>
          <strong>{restaurant.address}</strong>
        </article>
        <article>
          <span>Phone</span>
          <strong>{restaurant.phone}</strong>
        </article>
        <article>
          <span>Email</span>
          <strong>{restaurant.email}</strong>
        </article>
        <article>
          <span>Opening hours</span>
          <strong>{restaurant.openingHours}</strong>
        </article>
      </div>
    </section>
  );
}

export default PublicContactPage;
