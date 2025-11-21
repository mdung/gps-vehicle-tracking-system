import { useEffect, useState } from 'react';
import { assignmentService } from '../services/assignmentService';
import { vehicleService } from '../services/vehicleService';
import { driverService } from '../services/driverService';
import { Vehicle } from '../types/vehicle';
import { Driver } from '../types/driver';
import { Assignment, AssignmentRequest } from '../types/assignment';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AssignmentRequest>({
    vehicleId: '',
    driverId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vehiclesData, driversData] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll(),
      ]);
      setVehicles(vehiclesData);
      setDrivers(driversData);
      await loadAssignments();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const activeAssignments: Assignment[] = [];
      for (const vehicle of vehicles.filter(v => v.status === 'ACTIVE')) {
        try {
          const assignment = await assignmentService.getByVehicle(vehicle.id);
          if (assignment.isActive) {
            activeAssignments.push(assignment);
          }
        } catch (error) {
          // No assignment for this vehicle
        }
      }
      setAssignments(activeAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  useEffect(() => {
    if (vehicles.length > 0) {
      loadAssignments();
    }
  }, [vehicles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignmentService.assign(formData);
      alert('Driver assigned successfully');
      setShowForm(false);
      setFormData({ vehicleId: '', driverId: '' });
      await loadAssignments();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error assigning driver');
    }
  };

  const handleUnassign = async (id: string) => {
    if (!confirm('Are you sure you want to unassign this driver?')) return;
    try {
      await assignmentService.unassign(id);
      alert('Driver unassigned successfully');
      await loadAssignments();
    } catch (error) {
      alert('Error unassigning driver');
    }
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Driver-Vehicle Assignments</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Assign Driver to Vehicle
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h3>Assign Driver to Vehicle</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Vehicle</label>
              <select
                value={formData.vehicleId}
                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.filter(v => v.status === 'ACTIVE').map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.licensePlate} - {v.model}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Driver</label>
              <select
                value={formData.driverId}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                required
              >
                <option value="">Select Driver</option>
                {drivers.filter(d => d.status === 'ACTIVE').map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} - {d.licenseNumber}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Assign</button>
              <button type="button" className="btn" onClick={() => { setShowForm(false); setFormData({ vehicleId: '', driverId: '' }); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Active Assignments</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Assigned At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>No active assignments</td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.vehicleLicensePlate}</td>
                  <td>{assignment.driverName}</td>
                  <td>{new Date(assignment.assignedAt).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleUnassign(assignment.id)}>Unassign</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



