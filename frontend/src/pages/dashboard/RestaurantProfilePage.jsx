import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as restaurantService from '../../services/restaurantService';
import { getApiErrorMessage } from '../../utils/apiError';

const emptyForm = {
  name: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  openingHours: '',
  logoUrl: '',
  coverImageUrl: '',
};

function RestaurantProfilePage() {
  const [form, setForm] = useState(emptyForm);
  const [restaurantId, setRestaurantId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRestaurant() {
      try {
        const response = await restaurantService.getMyRestaurant();
        if (!isMounted) {
          return;
        }

        const restaurant = response;
        setRestaurantId(restaurant.id);
        setForm({
          name: restaurant.name || '',
          description: restaurant.description || '',
          address: restaurant.address || '',
          phone: restaurant.phone || '',
          email: restaurant.email || '',
          openingHours: restaurant.openingHours || '',
          logoUrl: restaurant.logoUrl || '',
          coverImageUrl: restaurant.coverImageUrl || '',
        });
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error(getApiErrorMessage(error, 'Failed to load restaurant profile.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadRestaurant();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = restaurantId
        ? await restaurantService.updateRestaurant(form)
        : await restaurantService.createRestaurant(form);

      setRestaurantId(response.id);
      toast.success(restaurantId ? 'Restaurant updated.' : 'Restaurant created.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save restaurant profile.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <section className="empty-state">Loading restaurant profile...</section>;
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Restaurant Profile</p>
        <h1>{restaurantId ? 'Update restaurant information' : 'Create your restaurant'}</h1>
      </div>

      <form className="dashboard-form" onSubmit={handleSubmit}>
        <label>
          Restaurant name
          <input name="name" value={form.name} onChange={handleChange} required maxLength={100} />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={1000}
            rows={4}
          />
        </label>

        <label>
          Address
          <textarea name="address" value={form.address} onChange={handleChange} required rows={3} />
        </label>

        <div className="form-grid">
          <label>
            Phone
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </label>

          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
        </div>

        <label>
          Opening hours
          <input
            name="openingHours"
            value={form.openingHours}
            onChange={handleChange}
            required
            placeholder="Mon-Sun, 10:00 AM - 11:00 PM"
          />
        </label>

        <div className="form-grid">
          <label>
            Logo URL
            <input name="logoUrl" value={form.logoUrl} onChange={handleChange} placeholder="https://..." maxLength={1000} />
          </label>

          <label>
            Cover image URL
            <input name="coverImageUrl" value={form.coverImageUrl} onChange={handleChange} placeholder="https://..." maxLength={1000} />
          </label>
        </div>

        {(form.logoUrl || form.coverImageUrl) && (
          <section className="image-preview-grid" aria-label="Restaurant media previews">
            {form.logoUrl && (
              <article>
                <span>Logo preview</span>
                <img src={form.logoUrl} alt="Restaurant logo preview" />
              </article>
            )}
            {form.coverImageUrl && (
              <article>
                <span>Cover preview</span>
                <img src={form.coverImageUrl} alt="Restaurant cover preview" />
              </article>
            )}
          </section>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : restaurantId ? 'Save changes' : 'Create restaurant'}
        </button>
      </form>
    </section>
  );
}

export default RestaurantProfilePage;
