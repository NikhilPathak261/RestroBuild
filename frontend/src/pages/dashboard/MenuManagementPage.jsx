import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import * as categoryService from '../../services/categoryService';
import * as menuService from '../../services/menuService';

const emptyForm = {
  categoryId: '',
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  foodType: 'VEG',
  spicyLevel: 0,
  sweetLevel: 0,
  preparationTime: 10,
  available: true,
};

function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredMenuItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return menuItems;
    }

    return menuItems.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [menuItems, search]);

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    setIsLoading(true);

    try {
      const [categoryResponse, menuResponse] = await Promise.all([
        categoryService.getCategories(),
        menuService.getMenuItems(),
      ]);
      setCategories(categoryResponse.data);
      setMenuItems(menuResponse.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load menu data.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      categoryId: String(item.categoryId),
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      imageUrl: item.imageUrl || '',
      foodType: item.foodType,
      spicyLevel: item.spicyLevel,
      sweetLevel: item.sweetLevel,
      preparationTime: item.preparationTime,
      available: item.available,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function buildPayload() {
    return {
      ...form,
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      spicyLevel: Number(form.spicyLevel),
      sweetLevel: Number(form.sweetLevel),
      preparationTime: Number(form.preparationTime),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.categoryId) {
      toast.error('Create or select a category first.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        await menuService.updateMenuItem(editingId, buildPayload());
        toast.success('Menu item updated.');
      } else {
        await menuService.createMenuItem(buildPayload());
        toast.success('Menu item created.');
      }

      resetForm();
      await loadPageData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save menu item.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleHideToggle(item) {
    try {
      if (item.hidden) {
        await menuService.showMenuItem(item.id);
        toast.success('Menu item shown.');
      } else {
        await menuService.hideMenuItem(item.id);
        toast.success('Menu item hidden.');
      }

      await loadPageData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update visibility.');
    }
  }

  async function handleAvailabilityToggle(item) {
    try {
      await menuService.updateAvailability(item.id, !item.available);
      toast.success('Availability updated.');
      await loadPageData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update availability.');
    }
  }

  async function handleDelete(itemId) {
    const confirmed = window.confirm('Delete this menu item? It will be hidden from customers.');
    if (!confirmed) {
      return;
    }

    try {
      await menuService.deleteMenuItem(itemId);
      toast.success('Menu item deleted.');
      await loadPageData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete menu item.');
    }
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Menu</p>
        <h1>Manage dishes</h1>
      </div>

      <div className="management-grid wide">
        <form className="dashboard-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit dish' : 'Create dish'}</h2>

          <label>
            Category
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Dish name
            <input name="name" value={form.name} onChange={handleChange} required maxLength={100} />
          </label>

          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} maxLength={1000} />
          </label>

          <div className="form-grid">
            <label>
              Price
              <input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleChange} required />
            </label>

            <label>
              Preparation time
              <input
                name="preparationTime"
                type="number"
                min="1"
                value={form.preparationTime}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Food type
              <select name="foodType" value={form.foodType} onChange={handleChange}>
                <option value="VEG">Veg</option>
                <option value="NON_VEG">Non-Veg</option>
              </select>
            </label>

            <label>
              Image URL
              <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Spicy level
              <input name="spicyLevel" type="number" min="0" max="3" value={form.spicyLevel} onChange={handleChange} />
            </label>

            <label>
              Sweet level
              <input name="sweetLevel" type="number" min="0" max="3" value={form.sweetLevel} onChange={handleChange} />
            </label>
          </div>

          <label className="checkbox-label">
            <input name="available" type="checkbox" checked={form.available} onChange={handleChange} />
            Available to order
          </label>

          <div className="button-row">
            <button type="submit" disabled={isSubmitting || categories.length === 0}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save changes' : 'Create dish'}
            </button>
            {editingId && (
              <button className="ghost-button inline" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="list-panel">
          <div className="list-header">
            <h2>Dish List</h2>
            <input
              aria-label="Search dishes"
              placeholder="Search dishes"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="empty-state compact">Loading menu items...</div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="empty-state compact">No menu items found.</div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Dish</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMenuItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.categoryName}</td>
                      <td>₹{item.price}</td>
                      <td>{item.hidden ? 'Hidden' : item.available ? 'Available' : 'Unavailable'}</td>
                      <td>
                        <div className="table-actions">
                          <button type="button" onClick={() => startEdit(item)}>
                            Edit
                          </button>
                          <button className="ghost-button inline" type="button" onClick={() => handleAvailabilityToggle(item)}>
                            {item.available ? 'Unavailable' : 'Available'}
                          </button>
                          <button className="ghost-button inline" type="button" onClick={() => handleHideToggle(item)}>
                            {item.hidden ? 'Show' : 'Hide'}
                          </button>
                          <button className="danger-button" type="button" onClick={() => handleDelete(item.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default MenuManagementPage;
