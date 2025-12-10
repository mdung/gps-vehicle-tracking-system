import React, { useState, useEffect } from 'react';
import { fuelService } from '../services/fuelService';
import { FuelEfficiency } from '../types/fuel';

interface FuelEfficiencyChartProps {
  vehicleId?: string;
  driverId?: string;
  startDate?: string;
  endDate?: string;
}

const FuelEfficiencyChart: React.FC<FuelEfficiencyChartProps> = ({
  vehicleId,
  driverId,
  startDate,
  endDate
}) => {
  const [efficiencyData, setEfficiencyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEfficiencyData();
  }, [vehicleId, driverId, startDate, endDate]);

  const loadEfficiencyData = async () => {
    try {
      setLoading(true);
      const data = await fuelService.getEfficiencyTrends(vehicleId, driverId, startDate, endDate);
      setEfficiencyData(data);
    } catch (error) {
      console.error('Failed to load efficiency data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="chart-container">
        <div className="loading">Loading efficiency data...</div>
      </div>
    );
  }

  if (efficiencyData.length === 0) {
    return (
      <div className="chart-container">
        <div className="no-data">No efficiency data available for the selected period.</div>
      </div>
    );
  }

  // Simple chart implementation (in a real app, you'd use a charting library like Chart.js or D3)
  const maxEfficiency = Math.max(...efficiencyData.map(d => d.efficiency));
  const minEfficiency = Math.min(...efficiencyData.map(d => d.efficiency));

  return (
    <div className="chart-container">
      <h3>Fuel Efficiency Trends</h3>
      <div className="simple-chart">
        <div className="chart-y-axis">
          <span>{maxEfficiency.toFixed(1)} km/L</span>
          <span>{((maxEfficiency + minEfficiency) / 2).toFixed(1)} km/L</span>
          <span>{minEfficiency.toFixed(1)} km/L</span>
        </div>
        <div className="chart-bars">
          {efficiencyData.map((data, index) => {
            const height = ((data.efficiency - minEfficiency) / (maxEfficiency - minEfficiency)) * 100;
            return (
              <div key={index} className="chart-bar-container">
                <div 
                  className="chart-bar" 
                  style={{ height: `${height}%` }}
                  title={`${data.date}: ${data.efficiency.toFixed(2)} km/L`}
                />
                <span className="chart-label">{data.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FuelEfficiencyChart;