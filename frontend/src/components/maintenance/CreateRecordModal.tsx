import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../../services/maintenanceService';
import { vehicleService } from '../../services/vehicleService';
import {
  MaintenanceType,
  MaintenanceStatus,
  MaintenancePriority,
  CreateMaintenanceRecordRequest
} from '../../types/maintenance';
import { Vehicle } from '../../types/vehicle';
import './MaintenanceModals.css';

interface CreateRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editRecord?: any;
}

const CreateRecordModal: React.FC<CreateRecordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editRecord
}) => {
  const [formData, setFormData] = useState<CreateMaintenanceRecordRequest>({
    vehicleId: '',
    maintenanceTypeId: '',
    maintenanceScheduleId: undefined,
    serviceDate: new Date().toISOString().split('T')[0],
    serviceMileage: undefined,
    serviceProvider: '',
    technicianName: '',
    laborCost: undefined,
    partsCost: undefined,
    durationHours: undefined,
    status: MaintenanceStatus.COMPLETED,
    priority: MaintenancePriority.MEDIUM,
    description: '',
    notes: '',
    warrantyExpiryDate: undefined,
    receiptNumber: '',
    createdBy: 'Current User'
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (editRecord) {
        setFormData({
          vehicleId: editRecord.vehicle.id,
          maintenanceTypeId: editRecord.maintenanceType.id,
          maintenanceScheduleId: editRecord.maintenanceSchedule?.id,
          serviceDate: editRecord.serviceDate,
          serviceMileage: editRecord.serviceMileage,
          serviceProvider: editRecord.serviceProvider || '',
          technicianName: editRecord.technicianName || '',
          laborCost: editRecord.laborCost,
          partsCost: editRecord.partsCost,
          durationHours: editRecord.durationHours,
          status: editRecord.status,
          priority: editRecord.priority,
          description: editRecord.description || '',
          notes: editRecord.notes || '',
          warrantyExpiryDate: editRecord.warrantyExpiryDate,
          receiptNumber: editRecord.receiptNumber || '',
          createdBy: editRecord.createdBy || 'Current User'
        });
      }
    }
  }, [isOpen, editRecord]);

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
      if (editRecord) {
        await maintenanceService.updateMaintenanceRecord(editRecord.id, formData);
      } else {
        await maintenanceService.createMaintenanceRecord(formData);
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError('Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      maintenanceTypeId: '',
      maintenanceScheduleId: undefined,
      serviceDate: new Date().toISOString().split('T')[0],
      serviceMileage: undefined,
      serviceProvider: '',
      technicianName: '',
      laborCost: undefined,
      partsCost: undefined,
      durationHours: undefined,
      status: MaintenanceStatus.COMPLETED,
      priority: MaintenancePriority.MEDIUM,
      description: '',
      notes: '',
      warrantyExpiryDate: undefined,
      receiptNumber: '',
      createdBy: 'Current User'
    });
  };

  const handleInputChange = (field: keyof CreateMaintenanceRecordRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>{editRecord ? 'Edit Record' : 'Create Maintenance Record'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="serviceDate">Service Date *</label>
              <input
                type="date"
                id="serviceDate"
                value={formData.serviceDate}
                onChange={(e) => handleInputChange('serviceDate', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="serviceMileage">Service Mileage</label>
              <input
                type="number"
                id="serviceMileage"
                value={formData.serviceMileage || ''}
                onChange={(e) => handleInputChange('serviceMileage', parseInt(e.target.value) || undefined)}
                placeholder="e.g., 45000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="serviceProvider">Service Provider</label>
              <input
                type="text"
                id="serviceProvider"
                value={formData.serviceProvider || ''}
                onChange={(e) => handleInputChange('serviceProvider', e.target.value)}
                placeholder="e.g., Quick Lube Express"
              />
            </div>

            <div className="form-group">
              <label htmlFor="technicianName">Technician Name</label>
              <input
                type="text"
                id="technicianName"
                value={formData.technicianName || ''}
                onChange={(e) => handleInputChange('technicianName', e.target.value)}
                placeholder="e.g., John Smith"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="laborCost">Labor Cost ($)</label>
              <input
                type="number"
                step="0.01"
                id="laborCost"
                value={formData.laborCost || ''}
                onChange={(e) => handleInputChange('laborCost', parseFloat(e.target.value) || undefined)}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="partsCost">Parts Cost ($)</label>
              <input
                type="number"
                step="0.01"
                id="partsCost"
                value={formData.partsCost || ''}
                onChange={(e) => handleInputChange('partsCost', parseFloat(e.target.value) || undefined)}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="durationHours">Duration (hours)</label>
              <input
                type="number"
                step="0.25"
                id="durationHours"
                value={formData.durationHours || ''}
                onChange={(e) => handleInputChange('durationHours', parseFloat(e.target.value) || undefined)}
                placeholder="1.5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as MaintenanceStatus)}
                required
              >
                <option value={MaintenanceStatus.SCHEDULED}>Scheduled</option>
                <option value={MaintenanceStatus.IN_PROGRESS}>In Progress</option>
                <option value={MaintenanceStatus.COMPLETED}>Completed</option>
                <option value={MaintenanceStatus.CANCELLED}>Cancelled</option>
                <option value={MaintenanceStatus.POSTPONED}>Postponed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as MaintenancePriority)}
              >
                <option value={MaintenancePriority.LOW}>Low</option>
                <option value={MaintenancePriority.MEDIUM}>Medium</option>
                <option value={MaintenancePriority.HIGH}>High</option>
                <option value={MaintenancePriority.CRITICAL}>Critical</option>
                <option value={MaintenancePriority.EMERGENCY}>Emergency</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="receiptNumber">Receipt Number</label>
              <input
                type="text"
                id="receiptNumber"
                value={formData.receiptNumber || ''}
                onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
                placeholder="e.g., RCP-2024-001"
              />
            </div>

            <div className="form-group">
              <label htmlFor="warrantyExpiryDate">Warranty Expiry Date</label>
              <input
                type="date"
                id="warrantyExpiryDate"
                value={formData.warrantyExpiryDate || ''}
                onChange={(e) => handleInputChange('warrantyExpiryDate', e.target.value || undefined)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              placeholder="Brief description of the maintenance work performed..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Additional notes, observations, or recommendations..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (editRecord ? 'Update Record' : 'Create Record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecordModal;