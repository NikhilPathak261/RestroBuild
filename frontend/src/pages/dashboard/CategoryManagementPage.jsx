import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import * as categoryService from '../../services/categoryService';
import { getApiErrorMessage } from '../../utils/apiError';

const emptyForm = {
  name: '',
  displayOrder: 0,
};

function CategoryManagementPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return categories;
    }

    return categories.filter((category) => category.name.toLowerCase().includes(keyword));
  }, [categories, search]);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setIsLoading(true);

    try {
      const response = await categoryService.getCategories();
      setCategories(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load categories.'));
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'displayOrder' ? Number(value) : value,
    }));
  }

  function startEdit(category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      displayOrder: category.displayOrder,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, form);
        toast.success('Category updated.');
      } else {
        await categoryService.createCategory(form);
        toast.success('Category created.');
      }

      resetForm();
      await loadCategories();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save category.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(categoryId) {
    const confirmed = window.confirm('Delete this category?');
    if (!confirmed) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      toast.success('Category deleted.');
      await loadCategories();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete category.'));
    }
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Categories</p>
        <h1>Organize your menu</h1>
      </div>

      <div className="management-grid">
        <form className="dashboard-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit category' : 'Create category'}</h2>

          <label>
            Category name
            <input name="name" value={form.name} onChange={handleChange} required maxLength={50} />
          </label>

          <label>
            Display order
            <input
              name="displayOrder"
              type="number"
              min="0"
              value={form.displayOrder}
              onChange={handleChange}
              required
            />
          </label>

          <div className="button-row">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save changes' : 'Create category'}
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
            <h2>Category List</h2>
            <input
              aria-label="Search categories"
              placeholder="Search categories"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="empty-state compact">Loading categories...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="empty-state compact">No categories found.</div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Order</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.displayOrder}</td>
                      <td>
                        <div className="table-actions">
                          <button type="button" onClick={() => startEdit(category)}>
                            Edit
                          </button>
                          <button className="danger-button" type="button" onClick={() => handleDelete(category.id)}>
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

export default CategoryManagementPage;
