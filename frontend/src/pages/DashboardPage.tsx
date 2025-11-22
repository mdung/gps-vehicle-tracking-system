import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { vehicleService } from '../services/vehicleService';
import { driverService } from '../services/driverService';
import { routeService } from '../services/routeService';
import { gpsLocationService } from '../services/gpsLocationService';
import { Vehicle } from '../types/vehicle';
import { Driver } from '../types/driver';
import { Route } from '../types/route';
import { GpsLocation } from '../types/gpsLocation';
import { useWebSocket } from '../hooks/useWebSocket';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [locations, setLocations] = useState<Map<string, GpsLocation>>(new Map());
  const [loading, setLoading] = useState(true);
  const { isConnected, latestLocation: wsLocation } = useWebSocket();

  useEffect(() => {
    loadData();
  }, []);

  // Update location when WebSocket receives update
  useEffect(() => {
    if (wsLocation) {
      console.log('WebSocket location update received on dashboard:', wsLocation);
      setLocations(prev => {
        const newMap = new Map(prev);
        newMap.set(wsLocation.vehicleId, wsLocation);
        return newMap;
      });
    }
  }, [wsLocation]);

  const loadData = async () => {
    try {
      const [vehiclesData, driversData, routesData] = await Promise.all([
        vehicleService.getAll(),
        driverService.getAll(),
        routeService.getAll(),
      ]);
      setVehicles(vehiclesData);
      setDrivers(driversData);
      setRoutes(routesData);
      
      // Load latest locations for all vehicles
      const locationsMap = new Map<string, GpsLocation>();
      for (const vehicle of vehiclesData) {
        try {
          const location = await gpsLocationService.getLatest(vehicle.id);
          locationsMap.set(vehicle.id, location);
        } catch (error) {
          // No location for this vehicle
        }
      }
      setLocations(locationsMap);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  const activeVehicles = vehicles.filter(v => v.status === 'ACTIVE').length;
  const activeDrivers = drivers.filter(d => d.status === 'ACTIVE').length;
  const activeRoutes = routes.filter(r => r.status === 'IN_PROGRESS').length;
  const completedRoutes = routes.filter(r => r.status === 'COMPLETED').length;
  const locationArray = Array.from(locations.values());
  const center = locationArray.length > 0
    ? [locationArray[0].latitude, locationArray[0].longitude]
    : [10.762622, 106.660172];

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: isConnected ? '#d4edda' : '#f8d7da', borderRadius: '5px' }}>
        <strong>WebSocket Status:</strong> {isConnected ? '🟢 Connected (Real-time updates enabled)' : '🔴 Disconnected (Polling mode)'}
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Vehicles</h3>
          <p>{vehicles.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Vehicles</h3>
          <p>{activeVehicles}</p>
        </div>
        <div className="stat-card">
          <h3>Total Drivers</h3>
          <p>{drivers.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Drivers</h3>
          <p>{activeDrivers}</p>
        </div>
        <div className="stat-card">
          <h3>Active Routes</h3>
          <p>{activeRoutes}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Routes</h3>
          <p>{completedRoutes}</p>
        </div>
      </div>

      <div className="card">
        <h3>Vehicle Locations</h3>
        <div className="map-container">
          <MapContainer center={center as [number, number]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locationArray.map((location) => (
              <Marker key={location.id} position={[location.latitude, location.longitude]}>
                <Popup>
                  <div>
                    <strong>{location.vehicleLicensePlate}</strong>
                    <br />
                    Speed: {location.speed || 0} km/h
                    <br />
                    Updated: {new Date(location.timestamp).toLocaleString()}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

