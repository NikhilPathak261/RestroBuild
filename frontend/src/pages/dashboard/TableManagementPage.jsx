import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as tableService from '../../services/tableService';

function TableManagementPage() {
  const [tables, setTables] = useState([]);
  const [numberOfTables, setNumberOfTables] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [tableNumber, setTableNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  async function loadTables() {
    setIsLoading(true);

    try {
      const response = await tableService.getTables();
      setTables(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load tables.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await tableService.createTables(Number(numberOfTables));
      toast.success('Tables created.');
      setNumberOfTables(1);
      await loadTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create tables.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEdit(table) {
    setEditingId(table.id);
    setTableNumber(String(table.tableNumber));
  }

  function cancelEdit() {
    setEditingId(null);
    setTableNumber('');
  }

  async function handleUpdate(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await tableService.updateTable(editingId, Number(tableNumber));
      toast.success('Table updated.');
      cancelEdit();
      await loadTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update table.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(tableId) {
    const confirmed = window.confirm('Delete this table?');
    if (!confirmed) {
      return;
    }

    try {
      await tableService.deleteTable(tableId);
      toast.success('Table deleted.');
      await loadTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete table.');
    }
  }

  async function handleGenerateQr() {
    try {
      await tableService.generateQrCodes();
      toast.success('QR links generated.');
      await loadTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate QR links.');
    }
  }

  async function handleRegenerateQr(tableId) {
    try {
      await tableService.regenerateQr(tableId);
      toast.success('QR link regenerated.');
      await loadTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to regenerate QR link.');
    }
  }

  async function copyQr(qrCodeUrl) {
    await navigator.clipboard.writeText(qrCodeUrl);
    toast.success('QR link copied.');
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Tables</p>
        <h1>Manage table QR links</h1>
      </div>

      <div className="management-grid">
        <div className="page-stack">
          <form className="dashboard-form" onSubmit={handleCreate}>
            <h2>Create tables</h2>
            <label>
              Number of tables
              <input
                type="number"
                min="1"
                max="500"
                value={numberOfTables}
                onChange={(event) => setNumberOfTables(event.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create tables'}
            </button>
          </form>

          {editingId && (
            <form className="dashboard-form" onSubmit={handleUpdate}>
              <h2>Edit table</h2>
              <label>
                Table number
                <input
                  type="number"
                  min="1"
                  value={tableNumber}
                  onChange={(event) => setTableNumber(event.target.value)}
                  required
                />
              </label>
              <div className="button-row">
                <button type="submit" disabled={isSubmitting}>
                  Save table
                </button>
                <button className="ghost-button inline" type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <section className="list-panel">
          <div className="list-header">
            <h2>Table List</h2>
            <button type="button" onClick={handleGenerateQr} disabled={tables.length === 0}>
              Generate QR links
            </button>
          </div>

          {isLoading ? (
            <div className="empty-state compact">Loading tables...</div>
          ) : tables.length === 0 ? (
            <div className="empty-state compact">No tables created yet.</div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Table</th>
                    <th>QR Link</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table) => (
                    <tr key={table.id}>
                      <td>Table {table.tableNumber}</td>
                      <td>
                        {table.qrCodeUrl ? (
                          <a href={table.qrCodeUrl} target="_blank" rel="noreferrer">
                            Open QR link
                          </a>
                        ) : (
                          <span className="muted">Not generated</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button type="button" onClick={() => startEdit(table)}>
                            Edit
                          </button>
                          <button className="ghost-button inline" type="button" onClick={() => handleRegenerateQr(table.id)}>
                            Regenerate
                          </button>
                          {table.qrCodeUrl && (
                            <button className="ghost-button inline" type="button" onClick={() => copyQr(table.qrCodeUrl)}>
                              Copy
                            </button>
                          )}
                          <button className="danger-button" type="button" onClick={() => handleDelete(table.id)}>
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

export default TableManagementPage;
