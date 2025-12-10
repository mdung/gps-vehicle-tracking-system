import React, { useState, useEffect } from 'react';
import { fuelService } from '../services/fuelService';
import { vehicleService } from '../services/vehicleService';
import { driverService } from '../services/driverService';
import { FuelRecord, FuelRecordRequest, FuelRecordType, FuelReport } from '../types/fuel';
import { Vehicle } from '../types/vehicle';
import { Driver } from '../types/driver';
import { useToast } from '../hooks/useToast';


const FuelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'records' | 'efficiency' | 'reports'>('records');
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [fuelReport, setFuelReport] = useState<FuelReport | null>(null);
  
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState<FuelRecordRequest>({
    vehicleId: '',
    driverId: '',
    fuelAmountLiters: 1,
    fuelCost: 1,
    costPerLiter: 1,
    odometerReading: 0,
    fuelStation: '',
    fuelType: 'Gasoline',
    recordType: FuelRecordType.REFUEL,
    notes: '',
    refuelDate: new Date().toISOString().slice(0, 16)
  });

  // Report filters
  const [reportFilters, setReportFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [vehiclesData, driversData] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll()
      ]);
      setVehicles(vehiclesData);
      setDrivers(driversData);
      await loadFuelRecords();
    } catch (error) {
      console.error('Error loading initial data:', error);
      showToast('Failed to load data. Please ensure the backend server is running.', 'error');
      // Set empty arrays to prevent UI issues
      setVehicles([]);
      setDrivers([]);
      setFuelRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFuelRecords = async () => {
    try {
      const response = await fuelService.getAllFuelRecords({}, 0, 50);
      setFuelRecords(response.content);
    } catch (error) {
      console.error('Error loading fuel records:', error);
      showToast('Failed to load fuel records', 'error');
      // Set empty array to prevent UI issues
      setFuelRecords([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.vehicleId) {
      showToast('Please select a vehicle', 'error');
      return;
    }
    
    if (formData.fuelAmountLiters <= 0) {
      showToast('Fuel amount must be greater than 0', 'error');
      return;
    }
    
    if (formData.fuelCost <= 0) {
      showToast('Fuel cost must be greater than 0', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await fuelService.createFuelRecord(formData);
      showToast('Fuel record created successfully', 'success');
      setShowAddForm(false);
      resetForm();
      await loadFuelRecords();
    } catch (error: any) {
      console.error('Error creating fuel record:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create fuel record';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: '',
      driverId: '',
      fuelAmountLiters: 1,
      fuelCost: 1,
      costPerLiter: 1,
      odometerReading: 0,
      fuelStation: '',
      fuelType: 'Gasoline',
      recordType: FuelRecordType.REFUEL,
      notes: '',
      refuelDate: new Date().toISOString().slice(0, 16)
    });
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const report = await fuelService.generateFuelReport(
        reportFilters.startDate,
        reportFilters.endDate
      );
      setFuelReport(report);
      showToast('Report generated successfully', 'success');
    } catch (error) {
      showToast('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateCostPerLiter = () => {
    if (formData.fuelAmountLiters > 0 && formData.fuelCost > 0) {
      const costPerLiter = formData.fuelCost / formData.fuelAmountLiters;
      setFormData(prev => ({ ...prev, costPerLiter: Number(costPerLiter.toFixed(3)) }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  return (
    <div className="fuel-page">
      <div className="page-header">
        <h1>Fuel Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
          disabled={loading}
        >
          Add Fuel Record
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          Fuel Records
        </button>
        <button
          className={`tab ${activeTab === 'efficiency' ? 'active' : ''}`}
          onClick={() => setActiveTab('efficiency')}
        >
          Efficiency Analysis
        </button>
        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      {/* Add Fuel Record Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Fuel Record</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
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
                  <label>Fuel Amount (Liters) *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={formData.fuelAmountLiters}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuelAmountLiters: Number(e.target.value) }))}
                    onBlur={calculateCostPerLiter}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Total Cost *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.fuelCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuelCost: Number(e.target.value) }))}
                    onBlur={calculateCostPerLiter}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cost per Liter</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.costPerLiter}
                    onChange={(e) => setFormData(prev => ({ ...prev, costPerLiter: Number(e.target.value) }))}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label>Odometer Reading</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.odometerReading}
                    onChange={(e) => setFormData(prev => ({ ...prev, odometerReading: Number(e.target.value) }))}
                  />
                </div>

                <div className="form-group">
                  <label>Fuel Station</label>
                  <input
                    type="text"
                    value={formData.fuelStation}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuelStation: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value }))}
                  >
                    <option value="Gasoline">Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="LPG">LPG</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Record Type *</label>
                  <select
                    value={formData.recordType}
                    onChange={(e) => setFormData(prev => ({ ...prev, recordType: e.target.value as FuelRecordType }))}
                    required
                  >
                    <option value={FuelRecordType.REFUEL}>Refuel</option>
                    <option value={FuelRecordType.CONSUMPTION_CALCULATION}>Consumption Calculation</option>
                    <option value={FuelRecordType.MAINTENANCE}>Maintenance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Refuel Date *</label>
                  <input
                    type="datetime-local"
                    value={formData.refuelDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, refuelDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'records' && (
          <div className="fuel-records-tab">
            <div className="records-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Amount (L)</th>
                    <th>Cost</th>
                    <th>Cost/L</th>
                    <th>Station</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelRecords.map(record => (
                    <tr key={record.id}>
                      <td>{formatDate(record.refuelDate)}</td>
                      <td>{record.vehicleLicensePlate}</td>
                      <td>{record.driverName || 'N/A'}</td>
                      <td>{record.fuelAmountLiters.toFixed(2)}</td>
                      <td>{formatCurrency(record.fuelCost)}</td>
                      <td>{formatCurrency(record.costPerLiter)}</td>
                      <td>{record.fuelStation || 'N/A'}</td>
                      <td>{record.fuelType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'efficiency' && (
          <div className="efficiency-tab">
            <div className="efficiency-content">
              <h3>Fuel Efficiency Analysis</h3>
              <p>Efficiency analysis features will be implemented here.</p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-tab">
            <div className="report-filters">
              <div className="filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) => setReportFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <button
                onClick={generateReport}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>

            {fuelReport && (
              <div className="report-content">
                <h3>Fuel Report Summary</h3>
                <div className="summary-cards">
                  <div className="summary-card">
                    <h4>Total Fuel Consumed</h4>
                    <p>{fuelReport.summary.totalFuelConsumed.toFixed(2)} L</p>
                  </div>
                  <div className="summary-card">
                    <h4>Total Cost</h4>
                    <p>{formatCurrency(fuelReport.summary.totalFuelCost)}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Average Efficiency</h4>
                    <p>{fuelReport.summary.averageFuelEfficiency.toFixed(2)} km/L</p>
                  </div>
                  <div className="summary-card">
                    <h4>Active Vehicles</h4>
                    <p>{fuelReport.summary.activeVehicles}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FuelPage;