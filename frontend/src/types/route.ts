export interface Route {
  id: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  driverId?: string;
  driverName?: string;
  startLocationId?: string;
  endLocationId?: string;
  startTime: string;
  endTime?: string;
  distanceKm?: number;
  status: string;
}



