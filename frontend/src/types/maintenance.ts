export interface MaintenanceType {
  id: string;
  name: string;
  description?: string;
  category: MaintenanceCategory;
  estimatedDurationHours?: number;
  estimatedCost?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum MaintenanceCategory {
  ENGINE = 'ENGINE',
  TRANSMISSION = 'TRANSMISSION',
  BRAKES = 'BRAKES',
  TIRES = 'TIRES',
  ELECTRICAL = 'ELECTRICAL',
  COOLING = 'COOLING',
  FUEL_SYSTEM = 'FUEL_SYSTEM',
  EXHAUST = 'EXHAUST',
  SUSPENSION = 'SUSPENSION',
  STEERING = 'STEERING',
  HVAC = 'HVAC',
  BODY = 'BODY',
  INTERIOR = 'INTERIOR',
  INSPECTION = 'INSPECTION',
  PREVENTIVE = 'PREVENTIVE',
  EMERGENCY = 'EMERGENCY'
}

export interface MaintenanceSchedule {
  id: string;
  vehicle: {
    id: string;
    licensePlate: string;
  };
  maintenanceType: MaintenanceType;
  scheduleType: ScheduleType;
  mileageInterval?: number;
  timeIntervalDays?: number;
  lastServiceDate?: string;
  lastServiceMileage?: number;
  nextDueDate?: string;
  nextDueMileage?: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  daysUntilDue?: number;
  milesUntilDue?: number;
  isOverdue?: boolean;
}

export enum ScheduleType {
  MILEAGE = 'MILEAGE',
  TIME = 'TIME',
  BOTH = 'BOTH'
}

export interface MaintenanceRecord {
  id: string;
  vehicle: {
    id: string;
    licensePlate: string;
  };
  maintenanceType: MaintenanceType;
  maintenanceSchedule?: MaintenanceSchedule;
  serviceDate: string;
  serviceMileage?: number;
  serviceProvider?: string;
  technicianName?: string;
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  durationHours?: number;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  description?: string;
  notes?: string;
  nextServiceDueDate?: string;
  nextServiceDueMileage?: number;
  warrantyExpiryDate?: string;
  receiptNumber?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export enum MaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED'
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY'
}

export interface MaintenanceReminder {
  id: string;
  vehicle: {
    id: string;
    licensePlate: string;
  };
  maintenanceSchedule: MaintenanceSchedule;
  reminderType: ReminderType;
  reminderDate: string;
  dueDate: string;
  dueMileage?: number;
  currentMileage?: number;
  daysOverdue: number;
  mileageOverdue: number;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  message?: string;
  priority: MaintenancePriority;
  createdAt: string;
  urgencyLevel?: string;
}

export enum ReminderType {
  DUE_SOON = 'DUE_SOON',
  DUE_TODAY = 'DUE_TODAY',
  OVERDUE = 'OVERDUE',
  CRITICAL_OVERDUE = 'CRITICAL_OVERDUE'
}

export interface MaintenanceCost {
  id: string;
  maintenanceRecord: {
    id: string;
  };
  costType: CostType;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  partNumber?: string;
  warrantyMonths: number;
  notes?: string;
  createdAt: string;
}

export enum CostType {
  LABOR = 'LABOR',
  PARTS = 'PARTS',
  FLUIDS = 'FLUIDS',
  CONSUMABLES = 'CONSUMABLES',
  TOOLS = 'TOOLS',
  EQUIPMENT_RENTAL = 'EQUIPMENT_RENTAL',
  TOWING = 'TOWING',
  DIAGNOSTIC = 'DIAGNOSTIC',
  DISPOSAL = 'DISPOSAL',
  OTHER = 'OTHER'
}

export interface MaintenanceAnalytics {
  totalCost: number;
  maintenanceCount: number;
  unacknowledgedReminders: number;
  overdueReminders: number;
  upcomingReminders: number;
  costByCategory: { [key: string]: number };
  costByMonth: { [key: string]: number };
  suppliers: string[];
}

export interface CreateMaintenanceTypeRequest {
  name: string;
  description?: string;
  category: MaintenanceCategory;
  estimatedDurationHours?: number;
  estimatedCost?: number;
}

export interface CreateMaintenanceScheduleRequest {
  vehicleId: string;
  maintenanceTypeId: string;
  scheduleType: ScheduleType;
  mileageInterval?: number;
  timeIntervalDays?: number;
  lastServiceDate?: string;
  lastServiceMileage?: number;
  notes?: string;
}

export interface CreateMaintenanceRecordRequest {
  vehicleId: string;
  maintenanceTypeId: string;
  maintenanceScheduleId?: string;
  serviceDate: string;
  serviceMileage?: number;
  serviceProvider?: string;
  technicianName?: string;
  laborCost?: number;
  partsCost?: number;
  durationHours?: number;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  description?: string;
  notes?: string;
  warrantyExpiryDate?: string;
  receiptNumber?: string;
  createdBy?: string;
}

export interface CreateMaintenanceCostRequest {
  maintenanceRecordId: string;
  costType: CostType;
  itemName: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
  partNumber?: string;
  warrantyMonths?: number;
  notes?: string;
}