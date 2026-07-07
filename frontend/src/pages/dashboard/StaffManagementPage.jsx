import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as staffService from '../../services/staffService';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'KITCHEN',
};

function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    setIsLoading(true);

    try {
      const response = await staffService.getStaff();
      setStaff(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load staff.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function startEdit(member) {
    setEditingId(member.id);
    setForm({
      name: member.name,
      email: member.email,
      password: '',
      role: member.role,
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
        await staffService.updateStaff(editingId, {
          name: form.name,
          email: form.email,
          role: form.role,
        });
        toast.success('Staff member updated.');
      } else {
        await staffService.createStaff(form);
        toast.success('Staff member created.');
      }

      resetForm();
      await loadStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save staff member.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function runAction(action, successMessage) {
    try {
      await action();
      toast.success(successMessage);
      await loadStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update staff member.');
    }
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Staff</p>
        <h1>Manage kitchen and waiter accounts</h1>
      </div>

      <div className="management-grid">
        <form className="dashboard-form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit staff' : 'Create staff'}</h2>

          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required maxLength={100} />
          </label>

          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>

          {!editingId && (
            <label>
              Password
              <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} />
            </label>
          )}

          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="KITCHEN">Kitchen</option>
              <option value="WAITER">Waiter</option>
            </select>
          </label>

          <div className="button-row">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingId ? 'Save changes' : 'Create staff'}
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
            <h2>Staff List</h2>
          </div>

          {isLoading ? (
            <div className="empty-state compact">Loading staff...</div>
          ) : staff.length === 0 ? (
            <div className="empty-state compact">No staff members found.</div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td>{member.active ? 'Active' : 'Disabled'}</td>
                      <td>
                        <div className="table-actions">
                          <button type="button" onClick={() => startEdit(member)}>
                            Edit
                          </button>
                          <button
                            className="ghost-button inline"
                            type="button"
                            onClick={() =>
                              runAction(
                                () => (member.active ? staffService.disableStaff(member.id) : staffService.enableStaff(member.id)),
                                member.active ? 'Staff member disabled.' : 'Staff member enabled.',
                              )
                            }
                          >
                            {member.active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            className="danger-button"
                            type="button"
                            onClick={() => runAction(() => staffService.deleteStaff(member.id), 'Staff member deleted.')}
                          >
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

export default StaffManagementPage;
