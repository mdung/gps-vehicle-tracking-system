export interface Assignment {
  id: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  driverId: string;
  driverName: string;
  assignedAt: string;
  unassignedAt?: string;
  isActive: boolean;
}

export interface AssignmentRequest {
  vehicleId: string;
  driverId: string;
}

