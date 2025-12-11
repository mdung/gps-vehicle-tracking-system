import React, { useState, useEffect } from 'react';
import { geofencingService } from '../services/geofencingService';
import { vehicleService } from '../services/vehicleService';
import {
  Geofence,
  GeofenceRequest,
  GeofenceAlert,
  GeofenceType,
  GeofenceShape,
  AlertType,
  AlertSeverity
} from '../types/geofencing';
import { Vehicle } from '../types/vehicle';
import { useToast } from '../hooks/useToast';
import '../styles/tables.css';

const GeofencingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geofences' | 'alerts' | 'assignments'>('geofences');
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState<GeofenceRequest>({
    name: '',
    description: '',
    type: GeofenceType.AUTHORIZED_AREA,
    shape: GeofenceShape.CIRCLE,
    centerLatitude: 40.7128,
    centerLongitude: -74.0060,
    radiusMeters: 500,
    alertType: AlertType.ENTRY_AND_EXIT,
    bufferTimeMinutes: 0,
    isActive: true
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('Loading geofencing data...');
      
      // Test health check first
      try {
        const healthResponse = await geofencingService.healthCheck();
        console.log('Geofencing service health:', healthResponse);
      } catch (healthError) {
        console.error('Geofencing service health check failed:', healthError);
        showToast('Geofencing service is not available. Please check if the backend is running.', 'error');
        return;
      }
      
      // Load data sequentially for better error tracking
      console.log('Loading geofences...');
      const geofencesData = await geofencingService.getAllGeofences(0, 50);
      console.log('Raw geofences response:', geofencesData);
      console.log('Geofences content:', geofencesData?.content);
      console.log('Geofences content length:', geofencesData?.content?.length);
      
      console.log('Loading vehicles...');
      const vehiclesData = await vehicleService.getAll();
      console.log('Vehicles data:', vehiclesData);
      
      console.log('Loading alerts...');
      const alertsData = await geofencingService.getUnacknowledgedAlerts();
      console.log('Alerts data:', alertsData);
      
      // Set the data
      const geofencesList = geofencesData?.content || [];
      const vehiclesList = vehiclesData || [];
      const alertsList = alertsData || [];
      
      console.log('Setting geofences:', geofencesList);
      console.log('Setting vehicles:', vehiclesList);
      console.log('Setting alerts:', alertsList);
      
      setGeofences(geofencesList);
      setVehicles(vehiclesList);
      setAlerts(alertsList);
      
      if (geofencesList.length > 0) {
        showToast(`Loaded ${geofencesList.length} geofences successfully`, 'success');
      } else {
        showToast('No geofences found. Create your first geofence to get started.', 'info');
      }
      
    } catch (error: any) {
      console.error('Error loading initial data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      showToast(`Failed to load data: ${errorMessage}`, 'error');
      setGeofences([]);
      setVehicles([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.name.trim()) {
      showToast('Please enter a geofence name', 'error');
      return;
    }
    
    if (formData.shape === GeofenceShape.CIRCLE) {
      if (!formData.centerLatitude || !formData.centerLongitude || !formData.radiusMeters) {
        showToast('Please provide center coordinates and radius for circular geofence', 'error');
        return;
      }
    }
    
    try {
      setLoading(true);
      if (editingGeofence) {
        await geofencingService.updateGeofence(editingGeofence.id, formData);
        showToast('Geofence updated successfully', 'success');
      } else {
        await geofencingService.createGeofence(formData);
        showToast('Geofence created successfully', 'success');
      }
      
      setShowAddForm(false);
      setEditingGeofence(null);
      resetForm();
      await loadInitialData();
    } catch (error: any) {
      console.error('Error saving geofence:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save geofence';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: GeofenceType.AUTHORIZED_AREA,
      shape: GeofenceShape.CIRCLE,
      centerLatitude: 40.7128,
      centerLongitude: -74.0060,
      radiusMeters: 500,
      alertType: AlertType.ENTRY_AND_EXIT,
      bufferTimeMinutes: 0,
      isActive: true
    });
  };

  const handleEdit = (geofence: Geofence) => {
    setEditingGeofence(geofence);
    setFormData({
      name: geofence.name,
      description: geofence.description || '',
      type: geofence.type,
      shape: geofence.shape,
      centerLatitude: geofence.centerLatitude,
      centerLongitude: geofence.centerLongitude,
      radiusMeters: geofence.radiusMeters,
      polygonCoordinates: geofence.polygonCoordinates,
      alertType: geofence.alertType,
      bufferTimeMinutes: geofence.bufferTimeMinutes,
      isActive: geofence.isActive
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this geofence?')) {
      return;
    }
    
    try {
      setLoading(true);
      await geofencingService.deleteGeofence(id);
      showToast('Geofence deleted successfully', 'success');
      await loadInitialData();
    } catch (error) {
      showToast('Failed to delete geofence', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await geofencingService.acknowledgeAlert(alertId, 'System User', 'Acknowledged via web interface');
      showToast('Alert acknowledged', 'success');
      await loadInitialData();
    } catch (error) {
      showToast('Failed to acknowledge alert', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityClass = (severity: AlertSeverity) => {
    const classes = {
      [AlertSeverity.LOW]: 'severity-low',
      [AlertSeverity.MEDIUM]: 'severity-medium',
      [AlertSeverity.HIGH]: 'severity-high',
      [AlertSeverity.CRITICAL]: 'severity-critical'
    };
    return classes[severity] || '';
  };

  return (
    <div className="geofencing-page">
      <div className="page-header">
        <h1>Geofencing & Alerts</h1>
        <div className="header-actions">
          <div className="alert-summary">
            <span className="alert-count critical">{alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length}</span>
            <span className="alert-count high">{alerts.filter(a => a.severity === AlertSeverity.HIGH).length}</span>
            <span className="alert-count medium">{alerts.filter(a => a.severity === AlertSeverity.MEDIUM).length}</span>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary"
            disabled={loading}
          >
            Create Geofence
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'geofences' ? 'active' : ''}`}
          onClick={() => setActiveTab('geofences')}
        >
          Geofences ({geofences.length})
        </button>
        <button
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Active Alerts ({alerts.length})
        </button>
        <button
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Vehicle Assignments
        </button>
      </div>

      {/* Add/Edit Geofence Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingGeofence ? 'Edit Geofence' : 'Create Geofence'}</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingGeofence(null);
                  resetForm();
                }}
                className="btn btn-secondary"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as GeofenceType }))}
                    required
                  >
                    <option value={GeofenceType.AUTHORIZED_AREA}>Authorized Area</option>
                    <option value={GeofenceType.RESTRICTED_AREA}>Restricted Area</option>
                    <option value={GeofenceType.CUSTOMER_LOCATION}>Customer Location</option>
                    <option value={GeofenceType.DEPOT}>Depot</option>
                    <option value={GeofenceType.SERVICE_AREA}>Service Area</option>
                    <option value={GeofenceType.ROUTE_CHECKPOINT}>Route Checkpoint</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Shape *</label>
                  <select
                    value={formData.shape}
                    onChange={(e) => setFormData(prev => ({ ...prev, shape: e.target.value as GeofenceShape }))}
                    required
                  >
                    <option value={GeofenceShape.CIRCLE}>Circle</option>
                    <option value={GeofenceShape.POLYGON}>Polygon</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Alert Type *</label>
                  <select
                    value={formData.alertType}
                    onChange={(e) => setFormData(prev => ({ ...prev, alertType: e.target.value as AlertType }))}
                    required
                  >
                    <option value={AlertType.ENTRY_ONLY}>Entry Only</option>
                    <option value={AlertType.EXIT_ONLY}>Exit Only</option>
                    <option value={AlertType.ENTRY_AND_EXIT}>Entry and Exit</option>
                    <option value={AlertType.UNAUTHORIZED_ENTRY}>Unauthorized Entry</option>
                    <option value={AlertType.ROUTE_DEVIATION}>Route Deviation</option>
                  </select>
                </div>

                {formData.shape === GeofenceShape.CIRCLE && (
                  <>
                    <div className="form-group">
                      <label>Center Latitude *</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.centerLatitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, centerLatitude: Number(e.target.value) }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Center Longitude *</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={formData.centerLongitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, centerLongitude: Number(e.target.value) }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Radius (meters) *</label>
                      <input
                        type="number"
                        min="10"
                        max="100000"
                        value={formData.radiusMeters}
                        onChange={(e) => setFormData(prev => ({ ...prev, radiusMeters: Number(e.target.value) }))}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Buffer Time (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    max="1440"
                    value={formData.bufferTimeMinutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, bufferTimeMinutes: Number(e.target.value) }))}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingGeofence(null);
                    resetForm();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingGeofence ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'geofences' && (
          <div className="geofences-tab">
            {loading ? (
              <div className="loading-state">
                <p>Loading geofences...</p>
              </div>
            ) : geofences.length === 0 ? (
              <div className="empty-state">
                <h3>No Geofences Found</h3>
                <p>Create your first geofence to start monitoring vehicle boundaries.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn btn-primary"
                >
                  Create Your First Geofence
                </button>
              </div>
            ) : (
              <div className="table-container">
                <div className="table-header">
                  <h3>Geofences</h3>
                  <p>Manage virtual boundaries and monitoring zones</p>
                </div>
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th>Geofence</th>
                      <th>Type</th>
                      <th>Shape</th>
                      <th>Alert Type</th>
                      <th>Vehicles</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geofences.map(geofence => (
                      <tr key={geofence.id}>
                        <td>
                          <div className="geofence-info">
                            <div className="name">{geofence.name}</div>
                            {geofence.description && <div className="description">{geofence.description}</div>}
                          </div>
                        </td>
                        <td>
                          <span className="optimization-type">
                            {geofencingService.getGeofenceTypeDisplayName(geofence.type)}
                          </span>
                        </td>
                        <td>{geofence.shape}</td>
                        <td>{geofence.alertType.replace(/_/g, ' ')}</td>
                        <td>
                          <span className="metric-value">{geofence.assignedVehicleCount || 0}</span>
                          <span className="metric-unit">vehicles</span>
                        </td>
                        <td>
                          <span className={`status-badge ${geofence.isActive ? 'active' : 'inactive'}`}>
                            {geofence.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(geofence)}
                              className="btn-action secondary"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(geofence.id)}
                              className="btn-action danger"
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
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="alerts-tab">
            {loading ? (
              <div className="loading-state">
                <p>Loading alerts...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="empty-state">
                <h3>No Active Alerts</h3>
                <p>All alerts have been acknowledged or no geofence violations have occurred.</p>
                <div className="alert-info">
                  <p><strong>To generate alerts:</strong></p>
                  <ul>
                    <li>Create geofences with alert types</li>
                    <li>Assign vehicles to geofences</li>
                    <li>GPS locations will trigger alerts when boundaries are crossed</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="table-container">
                <div className="table-header">
                  <h3>Active Alerts</h3>
                  <p>Geofence violations and boundary crossings</p>
                </div>
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Vehicle</th>
                      <th>Geofence</th>
                      <th>Alert Type</th>
                      <th>Severity</th>
                      <th>Message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map(alert => (
                      <tr key={alert.id}>
                        <td>
                          <div className="date-time">
                            <div className="date">{new Date(alert.alertTime).toLocaleDateString()}</div>
                            <div className="time">{new Date(alert.alertTime).toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td>
                          <div className="vehicle-info">
                            <div className="license-plate">{alert.vehicleLicensePlate}</div>
                          </div>
                        </td>
                        <td>
                          <div className="geofence-info">
                            <div className="name">{alert.geofenceName}</div>
                          </div>
                        </td>
                        <td>
                          <div className="alert-type">
                            <span className="icon">{geofencingService.getAlertTypeIcon(alert.alertType)}</span>
                            {alert.alertType.replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td>
                          <span className={`severity-badge ${alert.severity.toLowerCase()}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td>{alert.message}</td>
                        <td>
                          {!alert.isAcknowledged && (
                            <button
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                              className="btn-action primary"
                            >
                              Acknowledge
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="assignments-tab">
            <div className="assignments-content">
              <h3>Vehicle Geofence Assignments</h3>
              <p>Vehicle assignment management will be implemented here.</p>
              <div className="assignment-summary">
                <div className="summary-card">
                  <h4>Total Geofences</h4>
                  <p>{geofences.length}</p>
                </div>
                <div className="summary-card">
                  <h4>Active Vehicles</h4>
                  <p>{vehicles.length}</p>
                </div>
                <div className="summary-card">
                  <h4>Total Assignments</h4>
                  <p>{geofences.reduce((sum, g) => sum + (g.assignedVehicleCount || 0), 0)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeofencingPage;