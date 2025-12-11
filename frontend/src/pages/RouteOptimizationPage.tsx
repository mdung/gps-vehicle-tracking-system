import React, { useState, useEffect } from 'react';
import { routeOptimizationService } from '../services/routeOptimizationService';
import { vehicleService } from '../services/vehicleService';
import { driverService } from '../services/driverService';
import {
  OptimizedRoute,
  RouteRequest,
  RouteStopRequest,
  OptimizationType,
  StopType,
  RouteStatus
} from '../types/routeOptimization';
import { Vehicle } from '../types/vehicle';
import { Driver } from '../types/driver';
import { useToast } from '../hooks/useToast';
import RouteReplayModal from '../components/RouteReplayModal';
import RouteAnalyticsModal from '../components/RouteAnalyticsModal';
import '../styles/tables.css';

const RouteOptimizationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routes' | 'create' | 'analytics'>('routes');
  const [routes, setRoutes] = useState<OptimizedRoute[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<OptimizedRoute | null>(null);
  const [showReplayModal, setShowReplayModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  
  const { showToast } = useToast();

  // Form state for creating new routes
  const [formData, setFormData] = useState<RouteRequest>({
    name: '',
    description: '',
    vehicleId: '',
    driverId: '',
    optimizationType: OptimizationType.BALANCED,
    stops: [],
    plannedStartTime: '',
    estimatedFuelCost: 0,
    notes: ''
  });

  const [currentStop, setCurrentStop] = useState<RouteStopRequest>({
    name: '',
    address: '',
    latitude: 40.7128,
    longitude: -74.0060,
    stopType: StopType.WAYPOINT,
    estimatedServiceTimeMinutes: 15,
    notes: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [routesData, vehiclesData, driversData] = await Promise.all([
        routeOptimizationService.getAllRoutes(0, 50),
        vehicleService.getAll(),
        driverService.getAll()
      ]);
      
      setRoutes(routesData.content || []);
      setVehicles(vehiclesData || []);
      setDrivers(driversData || []);
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      showToast('Failed to load route optimization data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.stops.length < 2) {
      showToast('Route must have at least 2 stops', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const newRoute = await routeOptimizationService.createRoute(formData);
      setRoutes(prev => [newRoute, ...prev]);
      showToast('Route created successfully', 'success');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        vehicleId: '',
        driverId: '',
        optimizationType: OptimizationType.BALANCED,
        stops: [],
        plannedStartTime: '',
        estimatedFuelCost: 0,
        notes: ''
      });
      
      setActiveTab('routes');
    } catch (error: any) {
      console.error('Error creating route:', error);
      showToast('Failed to create route', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStop = () => {
    if (!currentStop.name.trim()) {
      showToast('Stop name is required', 'error');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      stops: [...prev.stops, { ...currentStop }]
    }));
    
    // Reset current stop
    setCurrentStop({
      name: '',
      address: '',
      latitude: 40.7128,
      longitude: -74.0060,
      stopType: StopType.WAYPOINT,
      estimatedServiceTimeMinutes: 15,
      notes: ''
    });
  };

  const handleRemoveStop = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }));
  };

  const handleStartRoute = async (routeId: string) => {
    try {
      setLoading(true);
      const updatedRoute = await routeOptimizationService.startRoute(routeId);
      setRoutes(prev => prev.map(r => r.id === routeId ? updatedRoute : r));
      showToast('Route started successfully', 'success');
    } catch (error: any) {
      console.error('Error starting route:', error);
      showToast('Failed to start route', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRoute = async (routeId: string) => {
    try {
      setLoading(true);
      const updatedRoute = await routeOptimizationService.completeRoute(routeId);
      setRoutes(prev => prev.map(r => r.id === routeId ? updatedRoute : r));
      showToast('Route completed successfully', 'success');
    } catch (error: any) {
      console.error('Error completing route:', error);
      showToast('Failed to complete route', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShowReplay = (route: OptimizedRoute) => {
    setSelectedRoute(route);
    setShowReplayModal(true);
  };

  const handleShowAnalytics = (route: OptimizedRoute) => {
    setSelectedRoute(route);
    setShowAnalyticsModal(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="route-optimization-page">
      <div className="page-header">
        <h1>Route Optimization</h1>
        <div className="header-actions">
          <button
            onClick={() => setActiveTab('create')}
            className="btn btn-primary"
            disabled={loading}
          >
            Create Route
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          Routes ({routes.length})
        </button>
        <button
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Route
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'routes' && (
          <div className="routes-tab">
            {loading ? (
              <div className="loading-state">
                <p>Loading routes...</p>
              </div>
            ) : routes.length === 0 ? (
              <div className="empty-state">
                <h3>No Routes Found</h3>
                <p>Create your first optimized route to get started.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="btn btn-primary"
                >
                  Create Your First Route
                </button>
              </div>
            ) : (
              <div className="table-container">
                <div className="table-header">
                  <h3>Optimized Routes</h3>
                  <p>Manage and monitor route planning and execution</p>
                </div>
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Vehicle</th>
                      <th>Driver</th>
                      <th>Status</th>
                      <th>Optimization</th>
                      <th>Stops</th>
                      <th>Distance</th>
                      <th>Efficiency</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map(route => (
                      <tr key={route.id}>
                        <td>
                          <div className="geofence-info">
                            <div className="name">{route.name}</div>
                            {route.description && <div className="description">{route.description}</div>}
                          </div>
                        </td>
                        <td>
                          <div className="vehicle-info">
                            <div className="license-plate">{route.vehicleLicensePlate}</div>
                          </div>
                        </td>
                        <td>
                          <div className="driver-info">
                            <div className="details">{route.driverName || 'Unassigned'}</div>
                          </div>
                        </td>
                        <td>
                          <span 
                            className={`status-badge ${route.status.toLowerCase().replace('_', '-')}`}
                            style={{ color: routeOptimizationService.getRouteStatusColor(route.status) }}
                          >
                            {routeOptimizationService.getRouteStatusDisplayName(route.status)}
                          </span>
                        </td>
                        <td>
                          <span className="optimization-type">
                            {routeOptimizationService.getOptimizationTypeDisplayName(route.optimizationType)}
                          </span>
                        </td>
                        <td>
                          <span className="metric-value">{route.stops.length}</span>
                          <span className="metric-unit">stops</span>
                        </td>
                        <td>
                          <span className="metric-value">
                            {route.totalDistanceKm ? routeOptimizationService.formatDistance(route.totalDistanceKm) : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="efficiency-score">
                            <span 
                              className="score"
                              style={{ 
                                color: route.efficiencyScore ? 
                                  routeOptimizationService.getPerformanceRatingColor(
                                    route.analytics?.performanceRating || 'N/A'
                                  ) : '#6c757d'
                              }}
                            >
                              {routeOptimizationService.formatEfficiencyScore(route.efficiencyScore)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {route.status === RouteStatus.PLANNED && (
                              <button
                                onClick={() => handleStartRoute(route.id)}
                                className="btn-action success"
                                disabled={loading}
                              >
                                Start
                              </button>
                            )}
                            {route.status === RouteStatus.IN_PROGRESS && (
                              <button
                                onClick={() => handleCompleteRoute(route.id)}
                                className="btn-action primary"
                                disabled={loading}
                              >
                                Complete
                              </button>
                            )}
                            {route.status === RouteStatus.COMPLETED && (
                              <>
                                <button
                                  onClick={() => handleShowReplay(route)}
                                  className="btn-action info"
                                >
                                  Replay
                                </button>
                                <button
                                  onClick={() => handleShowAnalytics(route)}
                                  className="btn-action secondary"
                                >
                                  Analytics
                                </button>
                              </>
                            )}
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

        {activeTab === 'create' && (
          <div className="create-route-tab">
            <form onSubmit={handleCreateRoute} className="route-form">
              <div className="form-section">
                <h3>Route Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Route Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Vehicle *</label>
                    <select
                      value={formData.vehicleId}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
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
                    <label>Driver</label>
                    <select
                      value={formData.driverId}
                      onChange={(e) => setFormData(prev => ({ ...prev, driverId: e.target.value }))}
                    >
                      <option value="">Select Driver</option>
                      {drivers.map(driver => (
                        <option key={driver.id} value={driver.id}>
                          {driver.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Optimization Type *</label>
                    <select
                      value={formData.optimizationType}
                      onChange={(e) => setFormData(prev => ({ ...prev, optimizationType: e.target.value as OptimizationType }))}
                      required
                    >
                      <option value={OptimizationType.SHORTEST_DISTANCE}>Shortest Distance</option>
                      <option value={OptimizationType.FASTEST_TIME}>Fastest Time</option>
                      <option value={OptimizationType.FUEL_EFFICIENT}>Fuel Efficient</option>
                      <option value={OptimizationType.BALANCED}>Balanced</option>
                      <option value={OptimizationType.CUSTOM}>Custom</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Planned Start Time</label>
                    <input
                      type="datetime-local"
                      value={formData.plannedStartTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, plannedStartTime: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Estimated Fuel Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.estimatedFuelCost}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedFuelCost: Number(e.target.value) }))}
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
                </div>
              </div>

              <div className="form-section">
                <h3>Add Stops</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Stop Name *</label>
                    <input
                      type="text"
                      value={currentStop.name}
                      onChange={(e) => setCurrentStop(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={currentStop.address}
                      onChange={(e) => setCurrentStop(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Latitude *</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={currentStop.latitude}
                      onChange={(e) => setCurrentStop(prev => ({ ...prev, latitude: Number(e.target.value) }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Longitude *</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={currentStop.longitude}
                      onChange={(e) => setCurrentStop(prev => ({ ...prev, longitude: Number(e.target.value) }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Stop Type *</label>
                    <select
                      value={currentStop.stopType}
                      onChange={(e) => setCurrentStop(prev => ({ ...prev, stopType: e.target.value as StopType }))}
                      required
                    >
                      <option value={StopType.DEPOT}>Depot</option>
                      <option value={StopType.PICKUP}>Pickup</option>
                      <option value={StopType.DELIVERY}>Delivery</option>
                      <option value={StopType.SERVICE}>Service</option>
                      <option value={StopType.CUSTOMER}>Customer</option>
                      <option value={StopType.WAYPOINT}>Waypoint</option>
                      <option value={StopType.FUEL_STATION}>Fuel Station</option>
                      <option value={StopType.REST_STOP}>Rest Stop</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Service Time (minutes)</label>
                    <input
                      type="number"
                      min="0"
                      max="480"
                      value={currentStop.estimatedServiceTimeMinutes}
                      onChange={(e) => setCurrentStop(prev => ({ ...prev, estimatedServiceTimeMinutes: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddStop}
                  className="btn btn-secondary"
                >
                  Add Stop
                </button>
              </div>

              {formData.stops.length > 0 && (
                <div className="form-section">
                  <h3>Route Stops ({formData.stops.length})</h3>
                  <div className="stops-list">
                    {formData.stops.map((stop, index) => (
                      <div key={index} className="stop-item">
                        <div className="stop-info">
                          <strong>{index + 1}. {stop.name}</strong>
                          <span className="stop-type">{routeOptimizationService.getStopTypeDisplayName(stop.stopType)}</span>
                          <span className="stop-location">({stop.latitude}, {stop.longitude})</span>
                          {stop.estimatedServiceTimeMinutes && (
                            <span className="service-time">{stop.estimatedServiceTimeMinutes}min</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(index)}
                          className="btn btn-sm btn-danger"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setActiveTab('routes')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || formData.stops.length < 2}
                >
                  {loading ? 'Creating...' : 'Create Optimized Route'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="analytics-content">
              <h3>Route Performance Analytics</h3>
              <div className="analytics-summary">
                <div className="summary-card">
                  <h4>Total Routes</h4>
                  <p>{routes.length}</p>
                </div>
                <div className="summary-card">
                  <h4>Completed Routes</h4>
                  <p>{routes.filter(r => r.status === RouteStatus.COMPLETED).length}</p>
                </div>
                <div className="summary-card">
                  <h4>In Progress</h4>
                  <p>{routes.filter(r => r.status === RouteStatus.IN_PROGRESS).length}</p>
                </div>
                <div className="summary-card">
                  <h4>Average Efficiency</h4>
                  <p>
                    {routes.filter(r => r.efficiencyScore).length > 0 ? 
                      routeOptimizationService.formatEfficiencyScore(
                        routes.filter(r => r.efficiencyScore)
                          .reduce((sum, r) => sum + (r.efficiencyScore || 0), 0) / 
                        routes.filter(r => r.efficiencyScore).length
                      ) : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Route Replay Modal */}
      {showReplayModal && selectedRoute && (
        <RouteReplayModal
          route={selectedRoute}
          onClose={() => {
            setShowReplayModal(false);
            setSelectedRoute(null);
          }}
        />
      )}

      {/* Route Analytics Modal */}
      {showAnalyticsModal && selectedRoute && (
        <RouteAnalyticsModal
          route={selectedRoute}
          onClose={() => {
            setShowAnalyticsModal(false);
            setSelectedRoute(null);
          }}
        />
      )}
    </div>
  );
};

export default RouteOptimizationPage;