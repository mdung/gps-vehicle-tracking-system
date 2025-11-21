export interface Vehicle {
  id: string;
  licensePlate: string;
  model: string;
  vehicleType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleRequest {
  licensePlate: string;
  model: string;
  vehicleType: string;
  status?: string;
}

