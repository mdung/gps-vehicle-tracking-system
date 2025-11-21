export interface GpsLocation {
  id: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  latitude: number;
  longitude: number;
  speed?: number;
  direction?: number;
  timestamp: string;
  createdAt: string;
}

export interface GpsLocationRequest {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  direction?: number;
  timestamp?: string;
}

