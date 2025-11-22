import { useEffect, useState } from 'react';
import { routeService } from '../services/routeService';
import { gpsLocationService } from '../services/gpsLocationService';
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

  const handleEndRoute = async (route: Route) => {
    if (!confirm(`End route for vehicle ${route.vehicleLicensePlate}?`)) {
      return;
    }

    try {
      let endLocationId: string;
      
      // Try to get the latest location for this vehicle
      try {
        const latestLocation = await gpsLocationService.getLatest(route.vehicleId);
        if (latestLocation && latestLocation.id) {
          endLocationId = latestLocation.id;
        } else {
          // If no latest location, use start location if available
          if (route.startLocationId) {
            endLocationId = route.startLocationId;
          } else {
            alert('No location found for this vehicle. Please add a GPS location first.');
            return;
          }
        }
      } catch (error: any) {
        // If getLatest fails (404), try to use start location
        if (error.response?.status === 404 && route.startLocationId) {
          endLocationId = route.startLocationId;
        } else {
          throw error;
        }
      }

      await routeService.endRoute(route.id, endLocationId);
      alert('Route ended successfully! Distance calculated.');
      loadRoutes(); // Reload to show updated status
    } catch (error: any) {
      console.error('Error ending route:', error);
      alert(error.response?.data?.message || 'Error ending route. Make sure the vehicle has GPS locations.');
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
              <th>Actions</th>
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
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: route.status === 'COMPLETED' ? '#27ae60' : '#f39c12',
                    color: 'white'
                  }}>
                    {route.status}
                  </span>
                </td>
                <td>
                  {route.status === 'IN_PROGRESS' && (
                    <button
                      className="btn btn-success"
                      onClick={() => handleEndRoute(route)}
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      End Route
                    </button>
                  )}
                  {route.status === 'COMPLETED' && (
                    <span style={{ color: '#7f8c8d', fontSize: '12px' }}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



