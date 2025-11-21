import { useEffect, useState } from 'react';
import { vehicleService } from '../services/vehicleService';
import { Vehicle, VehicleRequest } from '../types/vehicle';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
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
      alert(`Error loading vehicles: ${error.message || 'Unknown error'}\nCheck console for details.`);
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
      loadVehicles();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving vehicle');
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
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await vehicleService.delete(id);
      loadVehicles();
    } catch (error) {
      alert('Error deleting vehicle');
    }
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div>
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



