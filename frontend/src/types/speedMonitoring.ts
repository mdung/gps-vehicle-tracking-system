export interface SpeedLimit {
  id: string;
  name: string;
  description?: string;
  areaType: AreaType;
  speedLimitKmh: number;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  polygonCoordinates?: string;
  roadType: RoadType;
  timeRestrictions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpeedViolation {
  id: string;
  vehicleId?: string;
  vehicleLicensePlate?: string;
  driverId?: string;
  driverName?: string;
  speedLimitId?: string;
  speedLimitName?: string;
  violationTime: string;
  recordedSpeedKmh: number;
  speedLimitKmh: number;
  speedOverLimitKmh: number;
  violationSeverity: ViolationSeverity;
  latitude: number;
  longitude: number;
  locationDescription?: string;
  weatherConditions?: string;
  roadConditions?: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  acknowledgmentNotes?: string;
  fineAmount?: number;
  pointsDeducted?: number;
  createdAt: string;
}

export interface SpeedHistory {
  id: string;
  vehicleId?: string;
  vehicleLicensePlate?: string;
  driverId?: string;
  driverName?: string;
  recordedTime: string;
  speedKmh: number;
  latitude: number;
  longitude: number;
  applicableSpeedLimitKmh?: number;
  isViolation: boolean;
  violationId?: string;
  roadType?: RoadType;
  weatherConditions?: string;
  speedOverLimit?: number;
  createdAt: string;
}

export interface SpeedReport {
  id: string;
  reportName: string;
  reportType: ReportType;
  vehicleId?: string;
  vehicleLicensePlate?: string;
  driverId?: string;
  driverName?: string;
  startDate: string;
  endDate: string;
  totalViolations: number;
  minorViolations: number;
  majorViolations: number;
  severeViolations: number;
  criticalViolations?: number;
  totalDistanceKm?: number;
  averageSpeedKmh?: number;
  maxSpeedKmh?: number;
  totalFineAmount?: number;
  totalPointsDeducted?: number;
  complianceRate?: number;
  riskLevel?: string;
  reportData?: string;
  generatedBy?: string;
  generatedAt: string;
}

export interface SpeedLimitRequest {
  name: string;
  description?: string;
  areaType: AreaType;
  speedLimitKmh: number;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  polygonCoordinates?: string;
  roadType: RoadType;
  timeRestrictions?: string;
  isActive: boolean;
}

export interface ViolationAcknowledgment {
  acknowledgedBy: string;
  notes?: string;
}

export interface ReportRequest {
  vehicleId?: string;
  driverId?: string;
  startDate: string;
  endDate: string;
  generatedBy: string;
}

export interface ViolationStatistics {
  minor: number;
  major: number;
  severe: number;
  critical: number;
  total: number;
}

export interface SpeedStatistics {
  vehicleId?: string;
  driverId?: string;
  violationCount: number;
  averageSpeed?: number;
  maxSpeed?: number;
  complianceRate?: number;
  riskLevel?: string;
}

export enum AreaType {
  GENERAL = 'GENERAL',
  BUSINESS_DISTRICT = 'BUSINESS_DISTRICT',
  RESIDENTIAL = 'RESIDENTIAL',
  SCHOOL_ZONE = 'SCHOOL_ZONE',
  HIGHWAY = 'HIGHWAY',
  CONSTRUCTION_ZONE = 'CONSTRUCTION_ZONE',
  HOSPITAL_ZONE = 'HOSPITAL_ZONE',
  INDUSTRIAL = 'INDUSTRIAL'
}

export enum RoadType {
  CITY_STREET = 'CITY_STREET',
  HIGHWAY = 'HIGHWAY',
  RESIDENTIAL = 'RESIDENTIAL',
  SCHOOL_ZONE = 'SCHOOL_ZONE',
  CONSTRUCTION_ZONE = 'CONSTRUCTION_ZONE',
  PARKING_LOT = 'PARKING_LOT',
  PRIVATE_ROAD = 'PRIVATE_ROAD'
}

export enum ViolationSeverity {
  MINOR = 'MINOR',
  MAJOR = 'MAJOR',
  SEVERE = 'SEVERE',
  CRITICAL = 'CRITICAL'
}

export enum ReportType {
  VIOLATION_SUMMARY = 'VIOLATION_SUMMARY',
  DRIVER_BEHAVIOR = 'DRIVER_BEHAVIOR',
  VEHICLE_PERFORMANCE = 'VEHICLE_PERFORMANCE',
  FLEET_OVERVIEW = 'FLEET_OVERVIEW',
  COMPLIANCE_REPORT = 'COMPLIANCE_REPORT',
  INSURANCE_REPORT = 'INSURANCE_REPORT'
}

export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: any;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}