import { useEffect, useState } from 'react';
import { driverService } from '../services/driverService';
import { Driver, DriverRequest } from '../types/driver';
import { useConfirm } from '../hooks/useConfirm';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const { confirm, confirmState } = useConfirm();
  const { toast, showToast, hideToast } = useToast();
  const [formData, setFormData] = useState<DriverRequest>({
    name: '',
    licenseNumber: '',
    phone: '',
    email: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const data = await driverService.getAll();
      setDrivers(data);
    } catch (error) {
      console.error('Error loading drivers:', error);
      showToast('Error loading drivers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await driverService.update(editingDriver.id, formData);
      } else {
        await driverService.create(formData);
      }
      setShowForm(false);
      setEditingDriver(null);
      setFormData({ name: '', licenseNumber: '', phone: '', email: '', status: 'ACTIVE' });
      showToast(editingDriver ? 'Driver updated successfully!' : 'Driver created successfully!', 'success');
      loadDrivers();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error saving driver', 'error');
    }
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      phone: driver.phone || '',
      email: driver.email || '',
      status: driver.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const driver = drivers.find(d => d.id === id);
    const confirmed = await confirm({
      title: 'Delete Driver?',
      message: `Are you sure you want to delete driver "${driver?.name}"?\n\nThis action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    
    if (!confirmed) return;
    
    try {
      await driverService.delete(id);
      showToast('Driver deleted successfully!', 'success');
      loadDrivers();
    } catch (error) {
      showToast('Error deleting driver', 'error');
    }
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div>
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.options?.title || ''}
        message={confirmState.options?.message || ''}
        confirmText={confirmState.options?.confirmText}
        cancelText={confirmState.options?.cancelText}
        type={confirmState.options?.type}
        onConfirm={() => confirmState.onConfirm?.()}
        onCancel={() => confirmState.onCancel?.()}
      />
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Drivers</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingDriver(null); setFormData({ name: '', licenseNumber: '', phone: '', email: '', status: 'ACTIVE' }); }}>
          Add Driver
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingDriver ? 'Edit Driver' : 'Add Driver'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>License Number</label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn" onClick={() => { setShowForm(false); setEditingDriver(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>License Number</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td>{driver.name}</td>
                <td>{driver.licenseNumber}</td>
                <td>{driver.phone || '-'}</td>
                <td>{driver.email || '-'}</td>
                <td>{driver.status}</td>
                <td>
                  <button className="btn btn-primary" style={{ marginRight: '5px' }} onClick={() => handleEdit(driver)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(driver.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



