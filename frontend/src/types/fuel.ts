export interface FuelRecord {
  id: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  vehicleModel: string;
  driverId?: string;
  driverName?: string;
  fuelAmountLiters: number;
  fuelCost: number;
  costPerLiter: number;
  odometerReading?: number;
  fuelStation?: string;
  fuelType?: string;
  recordType: FuelRecordType;
  notes?: string;
  refuelDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelRecordRequest {
  vehicleId: string;
  driverId?: string;
  fuelAmountLiters: number;
  fuelCost: number;
  costPerLiter: number;
  odometerReading?: number;
  fuelStation?: string;
  fuelType?: string;
  recordType: FuelRecordType;
  notes?: string;
  refuelDate: string;
}

export interface FuelEfficiency {
  id: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  vehicleModel: string;
  driverId?: string;
  driverName?: string;
  periodStart: string;
  periodEnd: string;
  totalDistanceKm: number;
  totalFuelConsumedLiters: number;
  fuelEfficiencyKmPerLiter: number;
  totalFuelCost: number;
  costPerKm: number;
  numberOfRefuels: number;
  averageCostPerLiter: number;
  calculationPeriod: CalculationPeriod;
  createdAt: string;
  updatedAt: string;
}

export interface FuelReport {
  reportPeriodStart: string;
  reportPeriodEnd: string;
  summary: FuelSummary;
  vehicleStats: VehicleFuelStats[];
  driverStats: DriverFuelStats[];
  efficiencyData: FuelEfficiency[];
  inefficiencyAlerts: InefficiencyAlert[];
}

export interface FuelSummary {
  totalFuelConsumed: number;
  totalFuelCost: number;
  averageFuelEfficiency: number;
  averageCostPerLiter: number;
  averageCostPerKm: number;
  totalRefuels: number;
  activeVehicles: number;
}

export interface VehicleFuelStats {
  vehicleId: string;
  licensePlate: string;
  model: string;
  totalFuelConsumed: number;
  totalFuelCost: number;
  fuelEfficiency: number;
  costPerKm: number;
  refuelCount: number;
  totalDistance: number;
}

export interface DriverFuelStats {
  driverId: string;
  name: string;
  totalFuelConsumed: number;
  totalFuelCost: number;
  averageFuelEfficiency: number;
  costPerKm: number;
  refuelCount: number;
  totalDistance: number;
}

export interface InefficiencyAlert {
  vehicleId: string;
  licensePlate: string;
  driverId?: string;
  driverName?: string;
  alertType: string;
  description: string;
  currentValue: number;
  benchmarkValue: number;
  severity: AlertSeverity;
}

export enum FuelRecordType {
  REFUEL = 'REFUEL',
  CONSUMPTION_CALCULATION = 'CONSUMPTION_CALCULATION',
  MAINTENANCE = 'MAINTENANCE'
}

export enum CalculationPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface FuelFilters {
  vehicleId?: string;
  driverId?: string;
  startDate?: string;
  endDate?: string;
  recordType?: FuelRecordType;
  fuelType?: string;
}

export interface EfficiencyFilters {
  vehicleId?: string;
  driverId?: string;
  calculationPeriod?: CalculationPeriod;
  startDate?: string;
  endDate?: string;
}