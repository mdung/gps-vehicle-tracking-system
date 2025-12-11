import React, { useState, useEffect } from 'react';
import { speedMonitoringService } from '../services/speedMonitoringService';
import { vehicleService } from '../services/vehicleService';
import { driverService } from '../services/driverService';
import {
  SpeedLimit,
  SpeedViolation,
  SpeedHistory,
  SpeedReport,
  SpeedLimitRequest,
  ViolationAcknowledgment,
  ReportRequest,
  ViolationStatistics,
  AreaType,
  RoadType,
  ViolationSeverity
} from '../types/speedMonitoring';
import { Vehicle } from '../types/vehicle';
import { Driver } from '../types/driver';
import { useToast } from '../hooks/useToast';
import '../styles/tables.css';
import '../styles/speedMonitoring.css';

const SpeedMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'violations' | 'history' | 'limits' | 'reports'>('violations');
  const [violations, setViolations] = useState<SpeedViolation[]>([]);
  const [speedHistory, setSpeedHistory] = useState<SpeedHistory[]>([]);
  const [speedLimits, setSpeedLimits] = useState<SpeedLimit[]>([]);
  const [reports, setReports] = useState<SpeedReport[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [statistics, setStatistics] = useState<ViolationStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddSpeedLimitForm, setShowAddSpeedLimitForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  
  const { showToast } = useToast();

  // Form states
  const [speedLimitForm, setSpeedLimitForm] = useState<SpeedLimitRequest>({
    name: '',
    description: '',
    areaType: AreaType.GENERAL,
    speedLimitKmh: 50,
    latitude: 40.7128,
    longitude: -74.0060,
    radiusMeters: 1000,
    roadType: RoadType.CITY_STREET,
    timeRestrictions: '',
    isActive: true
  });

  const [reportForm, setReportForm] = useState<ReportRequest>({
    vehicleId: '',
    driverId: '',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    generatedBy: 'System User'
  });

  // Filters
  const [violationFilters, setViolationFilters] = useState({
    vehicleId: '',
    driverId: '',
    severity: '',
    acknowledged: 'all'
  });

  const [historyFilters, setHistoryFilters] = useState({
    vehicleId: '',
    driverId: '',
    violationsOnly: false
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [vehiclesData, driversData, statisticsData] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll(),
        speedMonitoringService.getViolationStatsBySeverity()
      ]);
      
      setVehicles(vehiclesData || []);
      setDrivers(driversData || []);
      setStatistics(statisticsData);
      
      await loadTabData();
      
    } catch (error: any) {
      console.error('Error loading initial data:', error);
      showToast('Failed to load speed monitoring data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'violations':
          await loadViolations();
          break;
        case 'history':
          await loadSpeedHistory();
          break;
        case 'limits':
          await loadSpeedLimits();
          break;
        case 'reports':
          // Reports are generated on demand
          break;
      }
    } catch (error: any) {
      console.error('Error loading tab data:', error);
      showToast(`Failed to load ${activeTab} data`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadViolations = async () => {
    try {
      let violationsData;
      
      if (violationFilters.vehicleId) {
        violationsData = await speedMonitoringService.getViolationsByVehicle(violationFilters.vehicleId, 0, 50);
      } else if (violationFilters.driverId) {
        violationsData = await speedMonitoringService.getViolationsByDriver(violationFilters.driverId, 0, 50);
      } else if (violationFilters.severity) {
        violationsData = await speedMonitoringService.getViolationsBySeverity(violationFilters.severity as ViolationSeverity, 0, 50);
      } else if (violationFilters.acknowledged === 'unacknowledged') {
        violationsData = await speedMonitoringService.getUnacknowledgedViolations(0, 50);
      } else {
        violationsData = await speedMonitoringService.getAllViolations(0, 50);
      }
      
      setViolations(violationsData.content || []);
    } catch (error) {
      console.error('Error loading violations:', error);
      setViolations([]);
    }
  };

  const loadSpeedHistory = async () => {
    try {
      let historyData;
      
      if (historyFilters.vehicleId) {
        historyData = await speedMonitoringService.getSpeedHistoryByVehicle(historyFilters.vehicleId, 0, 50);
      } else if (historyFilters.driverId) {
        historyData = await speedMonitoringService.getSpeedHistoryByDriver(historyFilters.driverId, 0, 50);
      } else if (historyFilters.violationsOnly) {
        historyData = await speedMonitoringService.getSpeedViolationHistory(0, 50);
      } else {
        historyData = await speedMonitoringService.getSpeedHistory(0, 50);
      }
      
      setSpeedHistory(historyData.content || []);
    } catch (error) {
      console.error('Error loading speed history:', error);
      setSpeedHistory([]);
    }
  };

  const loadSpeedLimits = async () => {
    try {
      const limitsData = await speedMonitoringService.getAllSpeedLimits(0, 50);
      setSpeedLimits(limitsData.content || []);
    } catch (error) {
      console.error('Error loading speed limits:', error);
      setSpeedLimits([]);
    }
  };

  const handleCreateSpeedLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await speedMonitoringService.createSpeedLimit(speedLimitForm);
      showToast('Speed limit created successfully', 'success');
      setShowAddSpeedLimitForm(false);
      resetSpeedLimitForm();
      await loadSpeedLimits();
    } catch (error: any) {
      console.error('Error creating speed limit:', error);
      showToast('Failed to create speed limit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpeedLimit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this speed limit?')) {
      return;
    }
    
    try {
      setLoading(true);
      await speedMonitoringService.deleteSpeedLimit(id);
      showToast('Speed limit deleted successfully', 'success');
      await loadSpeedLimits();
    } catch (error) {
      showToast('Failed to delete speed limit', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeViolation = async (violationId: string) => {
    try {
      const acknowledgment: ViolationAcknowledgment = {
        acknowledgedBy: 'System User',
        notes: 'Acknowledged via web interface'
      };
      
      await speedMonitoringService.acknowledgeViolation(violationId, acknowledgment);
      showToast('Violation acknowledged', 'success');
      await loadViolations();
    } catch (error) {
      showToast('Failed to acknowledge violation', 'error');
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const report = await speedMonitoringService.generateReport(reportForm);
      setReports(prev => [report, ...prev]);
      showToast('Report generated successfully', 'success');
      setShowReportForm(false);
    } catch (error: any) {
      console.error('Error generating report:', error);
      showToast('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetSpeedLimitForm = () => {
    setSpeedLimitForm({
      name: '',
      description: '',
      areaType: AreaType.GENERAL,
      speedLimitKmh: 50,
      latitude: 40.7128,
      longitude: -74.0060,
      radiusMeters: 1000,
      roadType: RoadType.CITY_STREET,
      timeRestrictions: '',
      isActive: true
    });
  };

  useEffect(() => {
    if (activeTab) {
      loadTabData();
    }
  }, [activeTab, violationFilters, historyFilters]);

  return (
    <div className="speed-monitoring-page">
      <div className="page-header">
        <div>
          <h1>Speed Monitoring & Violations</h1>
          <p style={{ margin: '5px 0 0 0', color: '#718096', fontSize: '14px' }}>
            Monitor vehicle speeds, track violations, and ensure fleet safety compliance
          </p>
        </div>
        <div className="header-actions">
          {statistics && (
            <div className="violation-summary">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '15px' }}>
                <span style={{ fontSize: '11px', color: '#718096', fontWeight: '600', marginBottom: '5px' }}>VIOLATIONS</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className="violation-count critical" title="Critical Violations">{statistics.critical}</span>
                  <span className="violation-count severe" title="Severe Violations">{statistics.severe}</span>
                  <span className="violation-count major" title="Major Violations">{statistics.major}</span>
                  <span className="violation-count minor" title="Minor Violations">{statistics.minor}</span>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowAddSpeedLimitForm(true)}
            className="btn btn-primary"
            disabled={loading}
          >
            <span>📍</span> Add Speed Limit
          </button>
          <button
            onClick={() => setShowReportForm(true)}
            className="btn btn-secondary"
            disabled={loading}
          >
            <span>📊</span> Generate Report
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'violations' ? 'active' : ''}`}
          onClick={() => setActiveTab('violations')}
        >
          Violations ({violations.length})
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Speed History ({speedHistory.length})
        </button>
        <button
          className={`tab ${activeTab === 'limits' ? 'active' : ''}`}
          onClick={() => setActiveTab('limits')}
        >
          Speed Limits ({speedLimits.length})
        </button>
        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports ({reports.length})
        </button>
      </div>

      {/* Add Speed Limit Modal */}
      {showAddSpeedLimitForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Speed Limit</h2>
              <button
                onClick={() => {
                  setShowAddSpeedLimitForm(false);
                  resetSpeedLimitForm();
                }}
                className="btn btn-secondary"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateSpeedLimit} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={speedLimitForm.name}
                    onChange={(e) => setSpeedLimitForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Speed Limit (km/h) *</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={speedLimitForm.speedLimitKmh}
                    onChange={(e) => setSpeedLimitForm(prev => ({ ...prev, speedLimitKmh: Number(e.target.value) }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Area Type *</label>
                  <select
                    value={speedLimitForm.areaType}
                    onChange={(e) => setSpeedLimitForm(prev => ({ ...prev, areaType: e.target.value as AreaType }))}
                    required
                  >
                    {Object.values(AreaType).map(type => (
                      <option key={type} value={type}>
                        {speedMonitoringService.getAreaTypeDisplayName(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Road Type *</label>
                  <select
                    value={speedLimitForm.roadType}
                    onChange={(e) => setSpeedLimitForm(prev => ({ ...prev, roadType: e.target.value as RoadType }))}
                    required
                  >
                    {Object.values(RoadType).map(type => (
                      <option key={type} value={type}>
                        {speedMonitoringService.getRoadTypeDisplayName(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={speedLimitForm.latitude}
                    onChange={(e) => setSpeedLimitForm(prev => ({ ...prev, latitude: Number(e.target.value) }))}
                  />
                </div>

                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={speedLimitForm.longitude}
                    onChange={(e) => setSpeedLimitForm(prev => ({ ...prev, longitude: Number(e.target.value) }))}
                  />
                </div>

                <div className="form-group">
                  <label>Radius (meters)</label>
                  <input
                    type="number"
                    min="50"
                    max="10000"
                    value={speedLimitForm.radiusMeters}
                    onChange={(e) => setSpeedLimitForm(prev => ({ ...prev, radiusMeters: Number(e.target.value) }))}
                  />
                </div>

                <div className="form-group">
                  <label>Time Restrictions</label>
                  <input
                    type="text"
                    placeholder="e.g., 7:00-9:00, 17:00-19:00"
                    value={speedLimitForm.timeRestrictions}
                    onChange={(e) => setSpeedLimitForm(prev => ({ ...prev, timeRestrictions: e.target.value }))}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={speedLimitForm.description}
                    onChange={(e) => setSpeedLimitForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={speedLimitForm.isActive}
                      onChange={(e) => setSpeedLimitForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSpeedLimitForm(false);
                    resetSpeedLimitForm();
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
                  {loading ? 'Creating...' : 'Create Speed Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Generate Speed Report</h2>
              <button
                onClick={() => setShowReportForm(false)}
                className="btn btn-secondary"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleGenerateReport} className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Vehicle (Optional)</label>
                  <select
                    value={reportForm.vehicleId}
                    onChange={(e) => setReportForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                  >
                    <option value="">All Vehicles</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.licensePlate} - {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Driver (Optional)</label>
                  <select
                    value={reportForm.driverId}
                    onChange={(e) => setReportForm(prev => ({ ...prev, driverId: e.target.value }))}
                  >
                    <option value="">All Drivers</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={reportForm.startDate}
                    onChange={(e) => setReportForm(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={reportForm.endDate}
                    onChange={(e) => setReportForm(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Generated By</label>
                  <input
                    type="text"
                    value={reportForm.generatedBy}
                    onChange={(e) => setReportForm(prev => ({ ...prev, generatedBy: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'violations' && (
          <div className="violations-tab">
            {/* Filters */}
            <div className="filters-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '16px' }}>🔍</span>
                <h4 style={{ margin: 0, color: '#4a5568', fontSize: '16px', fontWeight: '600' }}>Filter Violations</h4>
              </div>
              <div className="filter-group">
                <label>🚗 Vehicle</label>
                <select
                  value={violationFilters.vehicleId}
                  onChange={(e) => setViolationFilters(prev => ({ ...prev, vehicleId: e.target.value }))}
                >
                  <option value="">All Vehicles ({vehicles.length})</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.licensePlate} - {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>👤 Driver</label>
                <select
                  value={violationFilters.driverId}
                  onChange={(e) => setViolationFilters(prev => ({ ...prev, driverId: e.target.value }))}
                >
                  <option value="">All Drivers ({drivers.length})</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>⚠️ Severity</label>
                <select
                  value={violationFilters.severity}
                  onChange={(e) => setViolationFilters(prev => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="">All Severities</option>
                  {Object.values(ViolationSeverity).map(severity => (
                    <option key={severity} value={severity}>
                      {speedMonitoringService.getViolationSeverityDisplayName(severity)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>✅ Status</label>
                <select
                  value={violationFilters.acknowledged}
                  onChange={(e) => setViolationFilters(prev => ({ ...prev, acknowledged: e.target.value }))}
                >
                  <option value="all">All Status</option>
                  <option value="unacknowledged">⏳ Unacknowledged</option>
                  <option value="acknowledged">✅ Acknowledged</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div style={{ fontSize: '32px', marginBottom: '15px' }}>⏳</div>
                <p>Loading speed violations...</p>
                <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '10px' }}>
                  Analyzing speed data and violation records
                </div>
              </div>
            ) : violations.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚗💨</div>
                <h3>No Speed Violations Found</h3>
                <p>Great news! No speed violations match your current filters. Your fleet is driving safely within speed limits.</p>
                <div className="alert-info">
                  <p><strong>To monitor speed violations:</strong></p>
                  <ul>
                    <li>Ensure speed limits are configured for your routes</li>
                    <li>GPS tracking is active on all vehicles</li>
                    <li>Speed monitoring service is running</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="table-container">
                <div className="table-header">
                  <h3>Speed Violations</h3>
                  <p>Monitor and manage speed limit violations</p>
                </div>
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Vehicle</th>
                      <th>Driver</th>
                      <th>Location</th>
                      <th>Speed</th>
                      <th>Over Limit</th>
                      <th>Severity</th>
                      <th>Fine</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violations.map(violation => (
                      <tr key={violation.id}>
                        <td>
                          <div className="date-time">
                            <div className="date">{new Date(violation.violationTime).toLocaleDateString()}</div>
                            <div className="time">{new Date(violation.violationTime).toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td>
                          <div className="vehicle-info">
                            <div className="license-plate">{violation.vehicleLicensePlate}</div>
                          </div>
                        </td>
                        <td>
                          <div className="driver-info">
                            <div className="details">{violation.driverName || 'Unknown'}</div>
                          </div>
                        </td>
                        <td>{violation.locationDescription || 'Unknown Location'}</td>
                        <td>
                          <span className="metric-value">{violation.recordedSpeedKmh}</span>
                          <span className="metric-unit">km/h</span>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Limit: {violation.speedLimitKmh} km/h
                          </div>
                        </td>
                        <td>
                          <span className="metric-value" style={{ color: '#ef4444' }}>
                            +{violation.speedOverLimitKmh}
                          </span>
                          <span className="metric-unit">km/h</span>
                        </td>
                        <td>
                          <span 
                            className={`severity-badge ${violation.violationSeverity.toLowerCase()}`}
                            style={{ color: speedMonitoringService.getViolationSeverityColor(violation.violationSeverity) }}
                          >
                            {violation.violationSeverity === 'CRITICAL' && '🚨'}
                            {violation.violationSeverity === 'SEVERE' && '⚠️'}
                            {violation.violationSeverity === 'MAJOR' && '🔶'}
                            {violation.violationSeverity === 'MINOR' && '🟡'}
                            {' '}
                            {speedMonitoringService.getViolationSeverityDisplayName(violation.violationSeverity)}
                          </span>
                        </td>
                        <td>
                          {violation.fineAmount ? speedMonitoringService.formatCurrency(violation.fineAmount) : 'N/A'}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {!violation.isAcknowledged && (
                              <button
                                onClick={() => handleAcknowledgeViolation(violation.id)}
                                className="btn-action primary"
                                title="Acknowledge this violation"
                              >
                                ✅ Acknowledge
                              </button>
                            )}
                            {violation.isAcknowledged && (
                              <span className="status-badge active" title="This violation has been acknowledged">
                                ✅ Acknowledged
                              </span>
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

        {activeTab === 'history' && (
          <div className="history-tab">
            {/* Filters */}
            <div className="filters-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '16px' }}>📊</span>
                <h4 style={{ margin: 0, color: '#4a5568', fontSize: '16px', fontWeight: '600' }}>Filter Speed History</h4>
              </div>
              <div className="filter-group">
                <label>🚗 Vehicle</label>
                <select
                  value={historyFilters.vehicleId}
                  onChange={(e) => setHistoryFilters(prev => ({ ...prev, vehicleId: e.target.value }))}
                >
                  <option value="">All Vehicles ({vehicles.length})</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.licensePlate} - {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>👤 Driver</label>
                <select
                  value={historyFilters.driverId}
                  onChange={(e) => setHistoryFilters(prev => ({ ...prev, driverId: e.target.value }))}
                >
                  <option value="">All Drivers ({drivers.length})</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={historyFilters.violationsOnly}
                    onChange={(e) => setHistoryFilters(prev => ({ ...prev, violationsOnly: e.target.checked }))}
                    style={{ width: 'auto', margin: 0 }}
                  />
                  <span>⚠️ Violations Only</span>
                </label>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div style={{ fontSize: '32px', marginBottom: '15px' }}>📊</div>
                <p>Loading speed history...</p>
                <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '10px' }}>
                  Retrieving historical speed data and GPS records
                </div>
              </div>
            ) : speedHistory.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📈</div>
                <h3>No Speed History Found</h3>
                <p>No speed history records match your current filters. Speed data will appear here as vehicles are tracked.</p>
                <div className="alert-info">
                  <p><strong>Speed history includes:</strong></p>
                  <ul>
                    <li>Real-time speed recordings from GPS</li>
                    <li>Speed limit compliance tracking</li>
                    <li>Violation detection and logging</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="table-container">
                <div className="table-header">
                  <h3>Speed History</h3>
                  <p>Historical speed data and violations</p>
                </div>
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Vehicle</th>
                      <th>Driver</th>
                      <th>Speed</th>
                      <th>Speed Limit</th>
                      <th>Over Limit</th>
                      <th>Road Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {speedHistory.map(record => (
                      <tr key={record.id} className={record.isViolation ? 'violation-row' : ''}>
                        <td>
                          <div className="date-time">
                            <div className="date">{new Date(record.recordedTime).toLocaleDateString()}</div>
                            <div className="time">{new Date(record.recordedTime).toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td>
                          <div className="vehicle-info">
                            <div className="license-plate">{record.vehicleLicensePlate}</div>
                          </div>
                        </td>
                        <td>
                          <div className="driver-info">
                            <div className="details">{record.driverName || 'Unknown'}</div>
                          </div>
                        </td>
                        <td>
                          <span className="metric-value">{record.speedKmh}</span>
                          <span className="metric-unit">km/h</span>
                        </td>
                        <td>
                          {record.applicableSpeedLimitKmh ? (
                            <>
                              <span className="metric-value">{record.applicableSpeedLimitKmh}</span>
                              <span className="metric-unit">km/h</span>
                            </>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          {record.speedOverLimit && record.speedOverLimit > 0 ? (
                            <span className="metric-value" style={{ color: '#ef4444' }}>
                              +{record.speedOverLimit} km/h
                            </span>
                          ) : (
                            <span style={{ color: '#10b981' }}>Within Limit</span>
                          )}
                        </td>
                        <td>
                          {record.roadType ? speedMonitoringService.getRoadTypeDisplayName(record.roadType) : 'Unknown'}
                        </td>
                        <td>
                          {record.isViolation ? (
                            <span className="status-badge danger">⚠️ Violation</span>
                          ) : (
                            <span className="status-badge active">✅ Normal</span>
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

        {activeTab === 'limits' && (
          <div className="limits-tab">
            {loading ? (
              <div className="loading-state">
                <div style={{ fontSize: '32px', marginBottom: '15px' }}>🚦</div>
                <p>Loading speed limits...</p>
                <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '10px' }}>
                  Fetching configured speed zones and restrictions
                </div>
              </div>
            ) : speedLimits.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚦</div>
                <h3>No Speed Limits Configured</h3>
                <p>Set up speed limits for different areas to enable automatic violation detection and monitoring.</p>
                <button
                  onClick={() => setShowAddSpeedLimitForm(true)}
                  className="btn btn-primary"
                >
                  <span>📍</span> Create Your First Speed Limit
                </button>
                <div className="alert-info" style={{ marginTop: '25px' }}>
                  <p><strong>Speed limit types you can create:</strong></p>
                  <ul>
                    <li>School zones with reduced limits</li>
                    <li>Highway and freeway limits</li>
                    <li>Business district restrictions</li>
                    <li>Residential area limits</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="table-container">
                <div className="table-header">
                  <h3>Speed Limits</h3>
                  <p>Manage speed limits for different areas and road types</p>
                </div>
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Speed Limit</th>
                      <th>Area Type</th>
                      <th>Road Type</th>
                      <th>Location</th>
                      <th>Radius</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {speedLimits.map(limit => (
                      <tr key={limit.id}>
                        <td>
                          <div className="geofence-info">
                            <div className="name">{limit.name}</div>
                            {limit.description && <div className="description">{limit.description}</div>}
                          </div>
                        </td>
                        <td>
                          <span className="metric-value">{limit.speedLimitKmh}</span>
                          <span className="metric-unit">km/h</span>
                        </td>
                        <td>
                          <span className="optimization-type">
                            {speedMonitoringService.getAreaTypeDisplayName(limit.areaType)}
                          </span>
                        </td>
                        <td>{speedMonitoringService.getRoadTypeDisplayName(limit.roadType)}</td>
                        <td>
                          {limit.latitude && limit.longitude ? (
                            <div style={{ fontSize: '12px' }}>
                              {limit.latitude.toFixed(4)}, {limit.longitude.toFixed(4)}
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          {limit.radiusMeters ? (
                            <>
                              <span className="metric-value">{limit.radiusMeters}</span>
                              <span className="metric-unit">m</span>
                            </>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${limit.isActive ? 'active' : 'inactive'}`}>
                            {limit.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleDeleteSpeedLimit(limit.id)}
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

        {activeTab === 'reports' && (
          <div className="reports-tab">
            {reports.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
                <h3>No Reports Generated</h3>
                <p>Create comprehensive speed monitoring reports to analyze driver behavior, compliance rates, and fleet performance.</p>
                <button
                  onClick={() => setShowReportForm(true)}
                  className="btn btn-primary"
                >
                  <span>📊</span> Generate Your First Report
                </button>
                <div className="alert-info" style={{ marginTop: '25px' }}>
                  <p><strong>Available report types:</strong></p>
                  <ul>
                    <li>Violation summary reports</li>
                    <li>Driver behavior analysis</li>
                    <li>Fleet compliance overview</li>
                    <li>Insurance and safety reports</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="table-container">
                <div className="table-header">
                  <h3>Speed Reports</h3>
                  <p>Generated reports on speeding incidents and driver behavior</p>
                </div>
                <table className="enhanced-table">
                  <thead>
                    <tr>
                      <th>Report Name</th>
                      <th>Period</th>
                      <th>Subject</th>
                      <th>Violations</th>
                      <th>Total Fine</th>
                      <th>Risk Level</th>
                      <th>Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report.id}>
                        <td>
                          <div className="geofence-info">
                            <div className="name">{report.reportName}</div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px' }}>
                            {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          {report.vehicleLicensePlate || report.driverName || 'Fleet Overview'}
                        </td>
                        <td>
                          <div className="violation-breakdown">
                            <span className="metric-value">{report.totalViolations}</span>
                            <div style={{ fontSize: '10px', color: '#6b7280' }}>
                              {report.severeViolations}S {report.majorViolations}M {report.minorViolations}m
                            </div>
                          </div>
                        </td>
                        <td>
                          {report.totalFineAmount ? speedMonitoringService.formatCurrency(report.totalFineAmount) : 'N/A'}
                        </td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ color: speedMonitoringService.getRiskLevelColor(report.riskLevel || 'LOW') }}
                          >
                            {report.riskLevel || 'LOW'}
                          </span>
                        </td>
                        <td>
                          <div className="date-time">
                            <div className="date">{new Date(report.generatedAt).toLocaleDateString()}</div>
                            <div className="time">{new Date(report.generatedAt).toLocaleTimeString()}</div>
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
      </div>
    </div>
  );
};

export default SpeedMonitoringPage;