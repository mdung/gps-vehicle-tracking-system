import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../../services/maintenanceService';
import { vehicleService } from '../../services/vehicleService';
import {
  MaintenanceType,
  ScheduleType,
  CreateMaintenanceScheduleRequest
} from '../../types/maintenance';
import { Vehicle } from '../../types/vehicle';
import './MaintenanceModals.css';

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editSchedule?: any;
}

const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editSchedule
}) => {
  const [formData, setFormData] = useState<CreateMaintenanceScheduleRequest>({
    vehicleId: '',
    maintenanceTypeId: '',
    scheduleType: ScheduleType.MILEAGE,
    mileageInterval: undefined,
    timeIntervalDays: undefined,
    lastServiceDate: undefined,
    lastServiceMileage: undefined,
    notes: ''
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (editSchedule) {
        setFormData({
          vehicleId: editSchedule.vehicle.id,
          maintenanceTypeId: editSchedule.maintenanceType.id,
          scheduleType: editSchedule.scheduleType,
          mileageInterval: editSchedule.mileageInterval,
          timeIntervalDays: editSchedule.timeIntervalDays,
          lastServiceDate: editSchedule.lastServiceDate,
          lastServiceMileage: editSchedule.lastServiceMileage,
          notes: editSchedule.notes || ''
        });
      }
    }
  }, [isOpen, editSchedule]);

  const loadData = async () => {
    try {
      const [vehiclesData, typesData] = await Promise.all([
        vehicleService.getAll(),
        maintenanceService.getAllActiveMaintenanceTypes()
      ]);
      setVehicles(vehiclesData);
      setMaintenanceTypes(typesData);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editSchedule) {
        await maintenanceService.updateMaintenanceSchedule(editSchedule.id, formData);
      } else {
        await maintenanceService.createMaintenanceSchedule(formData);
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError('Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      maintenanceTypeId: '',
      scheduleType: ScheduleType.MILEAGE,
      mileageInterval: undefined,
      timeIntervalDays: undefined,
      lastServiceDate: undefined,
      lastServiceMileage: undefined,
      notes: ''
    });
  };

  const handleInputChange = (field: keyof CreateMaintenanceScheduleRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editSchedule ? 'Edit Schedule' : 'Create Maintenance Schedule'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="vehicleId">Vehicle *</label>
            <select
              id="vehicleId"
              value={formData.vehicleId}
              onChange={(e) => handleInputChange('vehicleId', e.target.value)}
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.licensePlate} - {vehicle.model}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="maintenanceTypeId">Maintenance Type *</label>
            <select
              id="maintenanceTypeId"
              value={formData.maintenanceTypeId}
              onChange={(e) => handleInputChange('maintenanceTypeId', e.target.value)}
              required
            >
              <option value="">Select Maintenance Type</option>
              {maintenanceTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.category})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="scheduleType">Schedule Type *</label>
            <select
              id="scheduleType"
              value={formData.scheduleType}
              onChange={(e) => handleInputChange('scheduleType', e.target.value as ScheduleType)}
              required
            >
              <option value={ScheduleType.MILEAGE}>Mileage Based</option>
              <option value={ScheduleType.TIME}>Time Based</option>
              <option value={ScheduleType.BOTH}>Both</option>
            </select>
          </div>

          {(formData.scheduleType === ScheduleType.MILEAGE || formData.scheduleType === ScheduleType.BOTH) && (
            <div className="form-group">
              <label htmlFor="mileageInterval">Mileage Interval (miles)</label>
              <input
                type="number"
                id="mileageInterval"
                value={formData.mileageInterval || ''}
                onChange={(e) => handleInputChange('mileageInterval', parseInt(e.target.value) || undefined)}
                placeholder="e.g., 5000"
              />
            </div>
          )}

          {(formData.scheduleType === ScheduleType.TIME || formData.scheduleType === ScheduleType.BOTH) && (
            <div className="form-group">
              <label htmlFor="timeIntervalDays">Time Interval (days)</label>
              <input
                type="number"
                id="timeIntervalDays"
                value={formData.timeIntervalDays || ''}
                onChange={(e) => handleInputChange('timeIntervalDays', parseInt(e.target.value) || undefined)}
                placeholder="e.g., 90"
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lastServiceDate">Last Service Date</label>
              <input
                type="date"
                id="lastServiceDate"
                value={formData.lastServiceDate || ''}
                onChange={(e) => handleInputChange('lastServiceDate', e.target.value || undefined)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastServiceMileage">Last Service Mileage</label>
              <input
                type="number"
                id="lastServiceMileage"
                value={formData.lastServiceMileage || ''}
                onChange={(e) => handleInputChange('lastServiceMileage', parseInt(e.target.value) || undefined)}
                placeholder="e.g., 45000"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Additional notes about this maintenance schedule..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (editSchedule ? 'Update Schedule' : 'Create Schedule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScheduleModal;