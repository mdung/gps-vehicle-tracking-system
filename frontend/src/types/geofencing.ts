export interface Geofence {
  id: string;
  name: string;
  description?: string;
  type: GeofenceType;
  shape: GeofenceShape;
  centerLatitude?: number;
  centerLongitude?: number;
  radiusMeters?: number;
  polygonCoordinates?: string;
  isActive: boolean;
  alertType: AlertType;
  bufferTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
  assignedVehicleCount?: number;
}

export interface GeofenceRequest {
  name: string;
  description?: string;
  type: GeofenceType;
  shape: GeofenceShape;
  centerLatitude?: number;
  centerLongitude?: number;
  radiusMeters?: number;
  polygonCoordinates?: string;
  alertType: AlertType;
  bufferTimeMinutes?: number;
  isActive?: boolean;
}

export interface GeofenceAlert {
  id: string;
  geofenceId: string;
  geofenceName: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  driverId?: string;
  driverName?: string;
  alertType: AlertEventType;
  severity: AlertSeverity;
  message: string;
  latitude: number;
  longitude: number;
  speed?: number;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  notes?: string;
  alertTime: string;
  createdAt: string;
}

export interface VehicleGeofenceAssignment {
  vehicleId: string;
  geofenceId: string;
  isActive: boolean;
  assignedAt: string;
  unassignedAt?: string;
}

export enum GeofenceType {
  AUTHORIZED_AREA = 'AUTHORIZED_AREA',
  RESTRICTED_AREA = 'RESTRICTED_AREA',
  CUSTOMER_LOCATION = 'CUSTOMER_LOCATION',
  DEPOT = 'DEPOT',
  SERVICE_AREA = 'SERVICE_AREA',
  ROUTE_CHECKPOINT = 'ROUTE_CHECKPOINT'
}

export enum GeofenceShape {
  CIRCLE = 'CIRCLE',
  POLYGON = 'POLYGON'
}

export enum AlertType {
  ENTRY_ONLY = 'ENTRY_ONLY',
  EXIT_ONLY = 'EXIT_ONLY',
  ENTRY_AND_EXIT = 'ENTRY_AND_EXIT',
  UNAUTHORIZED_ENTRY = 'UNAUTHORIZED_ENTRY',
  ROUTE_DEVIATION = 'ROUTE_DEVIATION'
}

export enum AlertEventType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
  UNAUTHORIZED_ENTRY = 'UNAUTHORIZED_ENTRY',
  ROUTE_DEVIATION = 'ROUTE_DEVIATION',
  SPEEDING_IN_ZONE = 'SPEEDING_IN_ZONE',
  EXTENDED_STAY = 'EXTENDED_STAY'
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface GeofenceFilters {
  type?: GeofenceType;
  isActive?: boolean;
  name?: string;
}

export interface AlertFilters {
  vehicleId?: string;
  geofenceId?: string;
  severity?: AlertSeverity;
  isAcknowledged?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}