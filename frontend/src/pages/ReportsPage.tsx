import { useEffect, useState } from 'react';
import { routeService } from '../services/routeService';
import { Route } from '../types/route';

export default function ReportsPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const data = await routeService.getAll();
      setRoutes(data);
    } catch (error) {
      console.error('Error loading routes:', error);
      alert('Error loading routes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  const totalDistance = routes
    .filter(r => r.distanceKm)
    .reduce((sum, r) => sum + (r.distanceKm || 0), 0);

  return (
    <div>
      <h2>Reports</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Routes</h3>
          <p>{routes.length}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Routes</h3>
          <p>{routes.filter(r => r.status === 'COMPLETED').length}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p>{routes.filter(r => r.status === 'IN_PROGRESS').length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Distance</h3>
          <p>{totalDistance.toFixed(2)} km</p>
        </div>
      </div>

      <div className="card">
        <h3>Route History</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Distance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id}>
                <td>{route.vehicleLicensePlate}</td>
                <td>{route.driverName || '-'}</td>
                <td>{new Date(route.startTime).toLocaleString()}</td>
                <td>{route.endTime ? new Date(route.endTime).toLocaleString() : '-'}</td>
                <td>{route.distanceKm ? `${route.distanceKm.toFixed(2)} km` : '-'}</td>
                <td>{route.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



