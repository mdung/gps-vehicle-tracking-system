export interface OptimizedRoute {
  id: string;
  name: string;
  description?: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  driverId?: string;
  driverName?: string;
  status: RouteStatus;
  optimizationType: OptimizationType;
  routeCoordinates?: string;
  totalDistanceKm?: number;
  estimatedDurationHours?: number;
  estimatedFuelCost?: number;
  actualDistanceKm?: number;
  actualDurationHours?: number;
  actualFuelCost?: number;
  efficiencyScore?: number;
  plannedStartTime?: string;
  plannedEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt: string;
  updatedAt: string;
  stops: RouteStop[];
  analytics?: RouteAnalytics;
}

export interface RouteStop {
  id: string;
  stopOrder: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  stopType: StopType;
  status?: StopStatus;
  estimatedServiceTimeMinutes?: number;
  actualServiceTimeMinutes?: number;
  plannedArrivalTime?: string;
  plannedDepartureTime?: string;
  actualArrivalTime?: string;
  actualDepartureTime?: string;
  isCompleted: boolean;
  notes?: string;
}

export interface RouteExecution {
  id: string;
  optimizedRouteId: string;
  sequenceNumber: number;
  latitude: number;
  longitude: number;
  speed?: number;
  direction?: number;
  distanceFromPlannedKm?: number;
  cumulativeDistanceKm?: number;
  timestamp: string;
  deviationType: DeviationType;
  notes?: string;
}

export interface RouteAnalytics {
  totalStops: number;
  completedStops: number;
  completionPercentage: number;
  averageDeviationKm: number;
  totalDeviations: number;
  timeVarianceHours: number;
  fuelEfficiencyScore?: number;
  performanceRating: string;
}

export interface RouteRequest {
  name: string;
  description?: string;
  vehicleId: string;
  driverId?: string;
  optimizationType: OptimizationType;
  stops: RouteStopRequest[];
  plannedStartTime?: string;
  estimatedFuelCost?: number;
  notes?: string;
}

export interface RouteStopRequest {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  stopType: StopType;
  estimatedServiceTimeMinutes?: number;
  plannedArrivalTime?: string;
  notes?: string;
}

export enum RouteStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED'
}

export enum OptimizationType {
  SHORTEST_DISTANCE = 'SHORTEST_DISTANCE',
  FASTEST_TIME = 'FASTEST_TIME',
  FUEL_EFFICIENT = 'FUEL_EFFICIENT',
  BALANCED = 'BALANCED',
  CUSTOM = 'CUSTOM'
}

export enum StopType {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
  SERVICE = 'SERVICE',
  WAYPOINT = 'WAYPOINT',
  DEPOT = 'DEPOT',
  CUSTOMER = 'CUSTOMER',
  FUEL_STATION = 'FUEL_STATION',
  REST_STOP = 'REST_STOP'
}

export enum StopStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  DELAYED = 'DELAYED'
}

export enum DeviationType {
  ON_ROUTE = 'ON_ROUTE',
  MINOR_DEVIATION = 'MINOR_DEVIATION',
  MAJOR_DEVIATION = 'MAJOR_DEVIATION',
  OFF_ROUTE = 'OFF_ROUTE',
  TRAFFIC_DETOUR = 'TRAFFIC_DETOUR',
  EMERGENCY_DETOUR = 'EMERGENCY_DETOUR'
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

export interface RouteFilters {
  status?: RouteStatus;
  optimizationType?: OptimizationType;
  vehicleId?: string;
  driverId?: string;
  startDate?: string;
  endDate?: string;
}