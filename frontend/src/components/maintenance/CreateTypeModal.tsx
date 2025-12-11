import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../../services/maintenanceService';
import {
  MaintenanceCategory,
  CreateMaintenanceTypeRequest
} from '../../types/maintenance';
import './MaintenanceModals.css';

interface CreateTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editType?: any;
}

const CreateTypeModal: React.FC<CreateTypeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editType
}) => {
  const [formData, setFormData] = useState<CreateMaintenanceTypeRequest>({
    name: '',
    description: '',
    category: MaintenanceCategory.PREVENTIVE,
    estimatedDurationHours: undefined,
    estimatedCost: undefined
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && editType) {
      setFormData({
        name: editType.name,
        description: editType.description || '',
        category: editType.category,
        estimatedDurationHours: editType.estimatedDurationHours,
        estimatedCost: editType.estimatedCost
      });
    } else if (isOpen) {
      resetForm();
    }
  }, [isOpen, editType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editType) {
        await maintenanceService.updateMaintenanceType(editType.id, formData);
      } else {
        await maintenanceService.createMaintenanceType(formData);
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError('Failed to save maintenance type');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: MaintenanceCategory.PREVENTIVE,
      estimatedDurationHours: undefined,
      estimatedCost: undefined
    });
  };

  const handleInputChange = (field: keyof CreateMaintenanceTypeRequest, value: any) => {
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
          <h2>{editType ? 'Edit Maintenance Type' : 'Create Maintenance Type'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder="e.g., Oil Change"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value as MaintenanceCategory)}
              required
            >
              <option value={MaintenanceCategory.ENGINE}>Engine</option>
              <option value={MaintenanceCategory.TRANSMISSION}>Transmission</option>
              <option value={MaintenanceCategory.BRAKES}>Brakes</option>
              <option value={MaintenanceCategory.TIRES}>Tires</option>
              <option value={MaintenanceCategory.ELECTRICAL}>Electrical</option>
              <option value={MaintenanceCategory.COOLING}>Cooling</option>
              <option value={MaintenanceCategory.FUEL_SYSTEM}>Fuel System</option>
              <option value={MaintenanceCategory.EXHAUST}>Exhaust</option>
              <option value={MaintenanceCategory.SUSPENSION}>Suspension</option>
              <option value={MaintenanceCategory.STEERING}>Steering</option>
              <option value={MaintenanceCategory.HVAC}>HVAC</option>
              <option value={MaintenanceCategory.BODY}>Body</option>
              <option value={MaintenanceCategory.INTERIOR}>Interior</option>
              <option value={MaintenanceCategory.INSPECTION}>Inspection</option>
              <option value={MaintenanceCategory.PREVENTIVE}>Preventive</option>
              <option value={MaintenanceCategory.EMERGENCY}>Emergency</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimatedDurationHours">Estimated Duration (hours)</label>
              <input
                type="number"
                step="0.25"
                id="estimatedDurationHours"
                value={formData.estimatedDurationHours || ''}
                onChange={(e) => handleInputChange('estimatedDurationHours', parseFloat(e.target.value) || undefined)}
                placeholder="1.5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="estimatedCost">Estimated Cost ($)</label>
              <input
                type="number"
                step="0.01"
                id="estimatedCost"
                value={formData.estimatedCost || ''}
                onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value) || undefined)}
                placeholder="75.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              placeholder="Detailed description of this maintenance type..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (editType ? 'Update Type' : 'Create Type')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTypeModal;