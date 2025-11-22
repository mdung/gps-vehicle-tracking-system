import { useEffect, useState } from 'react';
import { assignmentService } from '../services/assignmentService';
import { vehicleService } from '../services/vehicleService';
import { driverService } from '../services/driverService';
import { Vehicle } from '../types/vehicle';
import { Driver } from '../types/driver';
import { Assignment, AssignmentRequest } from '../types/assignment';
import { useConfirm } from '../hooks/useConfirm';
import { useToast } from '../hooks/useToast';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

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
  const { confirm, confirmState } = useConfirm();
  const { toast, showToast, hideToast } = useToast();

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
    
    // Check if vehicle already has an active assignment
    const existingAssignment = assignments.find(a => a.vehicleId === formData.vehicleId);
    if (existingAssignment) {
      const confirmed = await confirm({
        title: 'Reassign Vehicle?',
        message: `Vehicle "${existingAssignment.vehicleLicensePlate}" is currently assigned to "${existingAssignment.driverName}".\n\nDo you want to reassign it to a different driver?`,
        confirmText: 'Yes, Reassign',
        cancelText: 'Cancel',
        type: 'warning',
      });
      if (!confirmed) {
        return;
      }
    }
    
    // Check if driver already has an active assignment
    const driverAssignment = assignments.find(a => a.driverId === formData.driverId);
    if (driverAssignment) {
      const confirmed = await confirm({
        title: 'Unassign Driver?',
        message: `This driver is currently assigned to vehicle "${driverAssignment.vehicleLicensePlate}".\n\nThis will unassign the driver from the current vehicle. Continue?`,
        confirmText: 'Yes, Continue',
        cancelText: 'Cancel',
        type: 'warning',
      });
      if (!confirmed) {
        return;
      }
    }
    
    try {
      await assignmentService.assign(formData);
      showToast('Driver assigned successfully!', 'success');
      setShowForm(false);
      setFormData({ vehicleId: '', driverId: '' });
      await loadAssignments();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Error assigning driver', 'error');
    }
  };

  const handleUnassign = async (id: string) => {
    const assignment = assignments.find(a => a.id === id);
    const confirmed = await confirm({
      title: 'Unassign Driver?',
      message: `Are you sure you want to unassign ${assignment?.driverName} from vehicle ${assignment?.vehicleLicensePlate}?`,
      confirmText: 'Yes, Unassign',
      cancelText: 'Cancel',
      type: 'danger',
    });
    
    if (!confirmed) return;
    
    try {
      await assignmentService.unassign(id);
      showToast('Driver unassigned successfully!', 'success');
      await loadAssignments();
    } catch (error) {
      showToast('Error unassigning driver', 'error');
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
                {vehicles.filter(v => v.status === 'ACTIVE').map((v) => {
                  const existingAssignment = assignments.find(a => a.vehicleId === v.id);
                  const assignmentInfo = existingAssignment 
                    ? ` (Currently: ${existingAssignment.driverName})` 
                    : '';
                  return (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} - {v.model}{assignmentInfo}
                    </option>
                  );
                })}
              </select>
              {formData.vehicleId && (() => {
                const existingAssignment = assignments.find(a => a.vehicleId === formData.vehicleId);
                return existingAssignment ? (
                  <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px', fontSize: '12px' }}>
                    ⚠️ This vehicle is currently assigned to: <strong>{existingAssignment.driverName}</strong>
                  </div>
                ) : null;
              })()}
            </div>
            <div className="form-group">
              <label>Driver</label>
              <select
                value={formData.driverId}
                onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                required
              >
                <option value="">Select Driver</option>
                {drivers.filter(d => d.status === 'ACTIVE').map((d) => {
                  const driverAssignment = assignments.find(a => a.driverId === d.id);
                  const assignmentInfo = driverAssignment 
                    ? ` (Currently: ${driverAssignment.vehicleLicensePlate})` 
                    : '';
                  return (
                    <option key={d.id} value={d.id}>
                      {d.name} - {d.licenseNumber}{assignmentInfo}
                    </option>
                  );
                })}
              </select>
              {formData.driverId && (() => {
                const driverAssignment = assignments.find(a => a.driverId === formData.driverId);
                return driverAssignment ? (
                  <div style={{ marginTop: '5px', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px', fontSize: '12px' }}>
                    ⚠️ This driver is currently assigned to: <strong>{driverAssignment.vehicleLicensePlate}</strong>
                  </div>
                ) : null;
              })()}
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



