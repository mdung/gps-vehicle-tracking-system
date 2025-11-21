import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { vehicleService } from '../services/vehicleService';
import { gpsLocationService } from '../services/gpsLocationService';
import { Vehicle } from '../types/vehicle';
import { GpsLocation, GpsLocationRequest } from '../types/gpsLocation';
import L from 'leaflet';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function TrackingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [locations, setLocations] = useState<GpsLocation[]>([]);
  const [latestLocation, setLatestLocation] = useState<GpsLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<GpsLocationRequest>({
    vehicleId: '',
    latitude: 0,
    longitude: 0,
    speed: 0,
    direction: 0,
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      loadLocations();
      loadLatestLocation();
    }
  }, [selectedVehicle]);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
      if (data.length > 0 && !selectedVehicle) {
        setSelectedVehicle(data[0].id);
        setFormData({ ...formData, vehicleId: data[0].id });
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    if (!selectedVehicle) return;
    try {
      const data = await gpsLocationService.getByVehicle(selectedVehicle);
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const loadLatestLocation = async () => {
    if (!selectedVehicle) return;
    try {
      const data = await gpsLocationService.getLatest(selectedVehicle);
      setLatestLocation(data);
    } catch (error) {
      console.error('Error loading latest location:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await gpsLocationService.create(formData);
      alert('Location updated successfully');
      setFormData({ ...formData, latitude: 0, longitude: 0, speed: 0, direction: 0 });
      loadLocations();
      loadLatestLocation();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating location');
    }
  };

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  const center = latestLocation
    ? [latestLocation.latitude, latestLocation.longitude]
    : [10.762622, 106.660172]; // Default to Ho Chi Minh City

  return (
    <div>
      <h2>GPS Tracking</h2>

      <div className="card">
        <h3>Update Location</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vehicle</label>
            <select
              value={formData.vehicleId}
              onChange={(e) => {
                setFormData({ ...formData, vehicleId: e.target.value });
                setSelectedVehicle(e.target.value);
              }}
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.licensePlate} - {v.model}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label>Speed (km/h)</label>
              <input
                type="number"
                step="any"
                value={formData.speed}
                onChange={(e) => setFormData({ ...formData, speed: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label>Direction (degrees)</label>
              <input
                type="number"
                step="any"
                value={formData.direction}
                onChange={(e) => setFormData({ ...formData, direction: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Update Location</button>
        </form>
      </div>

      <div className="card">
        <h3>Map View</h3>
        <div className="map-container">
          <MapContainer center={center as [number, number]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {latestLocation && (
              <Marker position={[latestLocation.latitude, latestLocation.longitude]}>
                <Popup>
                  <div>
                    <strong>{latestLocation.vehicleLicensePlate}</strong>
                    <br />
                    Speed: {latestLocation.speed || 0} km/h
                    <br />
                    Updated: {new Date(latestLocation.timestamp).toLocaleString()}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>

      <div className="card">
        <h3>Location History</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Speed</th>
              <th>Direction</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {locations.slice(0, 10).map((location) => (
              <tr key={location.id}>
                <td>{location.vehicleLicensePlate}</td>
                <td>{location.latitude.toFixed(6)}</td>
                <td>{location.longitude.toFixed(6)}</td>
                <td>{location.speed || 0} km/h</td>
                <td>{location.direction || 0}°</td>
                <td>{new Date(location.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

