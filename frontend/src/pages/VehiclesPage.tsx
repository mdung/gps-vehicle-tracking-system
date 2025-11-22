import { useEffect, useState } from 'react';
import { vehicleService } from '../services/vehicleService';
import { Vehicle, VehicleRequest } from '../types/vehicle';
import { useConfirm } from '../hooks/useConfirm';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { confirm, confirmState } = useConfirm();
  const { toast, showToast, hideToast } = useToast();
  const [formData, setFormData] = useState<VehicleRequest>({
    licensePlate: '',
    model: '',
    vehicleType: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      console.log('Loading vehicles...');
      const data = await vehicleService.getAll();
      console.log('Vehicles loaded:', data);
      console.log('Number of vehicles:', data?.length);
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Error loading vehicles:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      showToast(`Error loading vehicles: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await vehicleService.update(editingVehicle.id, formData);
      } else {
        await vehicleService.create(formData);
      }
      setShowForm(false);
      setEditingVehicle(null);
      setFormData({ licensePlate: '', model: '', vehicleType: '', status: 'ACTIVE' });
      showToast(editingVehicle ? 'Vehicle updated successfully!' : 'Vehicle created successfully!', 'success');
      loadVehicles();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error saving vehicle', 'error');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate,
      model: vehicle.model,
      vehicleType: vehicle.vehicleType,
      status: vehicle.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    const confirmed = await confirm({
      title: 'Delete Vehicle?',
      message: `Are you sure you want to delete vehicle "${vehicle?.licensePlate}"?\n\nThis action cannot be undone.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    
    if (!confirmed) return;
    
    try {
      await vehicleService.delete(id);
      showToast('Vehicle deleted successfully!', 'success');
      loadVehicles();
    } catch (error) {
      showToast('Error deleting vehicle', 'error');
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
        <h2>Vehicles</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingVehicle(null); setFormData({ licensePlate: '', model: '', vehicleType: '', status: 'ACTIVE' }); }}>
          Add Vehicle
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>License Plate</label>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Vehicle Type</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                required
              >
                <option value="">Select Type</option>
                <option value="TRUCK">Truck</option>
                <option value="CAR">Car</option>
                <option value="VAN">Van</option>
                <option value="MOTORCYCLE">Motorcycle</option>
              </select>
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
              <button type="button" className="btn" onClick={() => { setShowForm(false); setEditingVehicle(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>License Plate</th>
              <th>Model</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.licensePlate}</td>
                <td>{vehicle.model}</td>
                <td>{vehicle.vehicleType}</td>
                <td>{vehicle.status}</td>
                <td>
                  <button className="btn btn-primary" style={{ marginRight: '5px' }} onClick={() => handleEdit(vehicle)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(vehicle.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



