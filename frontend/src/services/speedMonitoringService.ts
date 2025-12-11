import axios from 'axios';
import {
  SpeedLimit,
  SpeedViolation,
  SpeedHistory,
  SpeedReport,
  SpeedLimitRequest,
  ViolationAcknowledgment,
  ReportRequest,
  ViolationStatistics,
  SpeedStatistics,
  PagedResponse,
  AreaType,
  RoadType,
  ViolationSeverity,
  ReportType
} from '../types/speedMonitoring';

const API_BASE_URL = 'http://localhost:8080/api/speed-monitoring';

class SpeedMonitoringService {
  
  // Speed Limits
  async getAllSpeedLimits(page: number = 0, size: number = 20): Promise<PagedResponse<SpeedLimit>> {
    const response = await axios.get(`${API_BASE_URL}/speed-limits`, {
      params: { page, size }
    });
    return response.data;
  }

  async getSpeedLimitById(id: string): Promise<SpeedLimit> {
    const response = await axios.get(`${API_BASE_URL}/speed-limits/${id}`);
    return response.data;
  }

  async createSpeedLimit(speedLimit: SpeedLimitRequest): Promise<SpeedLimit> {
    const response = await axios.post(`${API_BASE_URL}/speed-limits`, speedLimit);
    return response.data;
  }

  async updateSpeedLimit(id: string, speedLimit: SpeedLimitRequest): Promise<SpeedLimit> {
    const response = await axios.put(`${API_BASE_URL}/speed-limits/${id}`, speedLimit);
    return response.data;
  }

  async deleteSpeedLimit(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/speed-limits/${id}`);
  }

  async getSpeedLimitsNearLocation(latitude: number, longitude: number): Promise<SpeedLimit[]> {
    const response = await axios.get(`${API_BASE_URL}/speed-limits/near`, {
      params: { latitude, longitude }
    });
    return response.data;
  }

  // Speed Violations
  async getAllViolations(page: number = 0, size: number = 20): Promise<PagedResponse<SpeedViolation>> {
    const response = await axios.get(`${API_BASE_URL}/violations`, {
      params: { page, size }
    });
    return response.data;
  }

  async getUnacknowledgedViolations(page: number = 0, size: number = 20): Promise<PagedResponse<SpeedViolation>> {
    const response = await axios.get(`${API_BASE_URL}/violations/unacknowledged`, {
      params: { page, size }
    });
    return response.data;
  }

  async getViolationsByVehicle(vehicleId: string, page: number = 0, size: number = 20): Promise<PagedResponse<SpeedViolation>> {
    const response = await axios.get(`${API_BASE_URL}/violations/vehicle/${vehicleId}`, {
      params: { page, size }
    });
    return response.data;
  }

  async getViolationsByDriver(driverId: string, page: number = 0, size: number = 20): Promise<PagedResponse<SpeedViolation>> {
    const response = await axios.get(`${API_BASE_URL}/violations/driver/${driverId}`, {
      params: { page, size }
    });
    return response.data;
  }

  async getViolationsBySeverity(severity: ViolationSeverity, page: number = 0, size: number = 20): Promise<PagedResponse<SpeedViolation>> {
    const response = await axios.get(`${API_BASE_URL}/violations/severity/${severity}`, {
      params: { page, size }
    });
    return response.data;
  }

  async getViolationsByDateRange(
    startTime: string, 
    endTime: string, 
    page: number = 0, 
    size: number = 20
  ): Promise<PagedResponse<SpeedViolation>> {
    const response = await axios.get(`${API_BASE_URL}/violations/date-range`, {
      params: { startTime, endTime, page, size }
    });
    return response.data;
  }

  async acknowledgeViolation(id: string, acknowledgment: ViolationAcknowledgment): Promise<SpeedViolation> {
    const response = await axios.post(`${API_BASE_URL}/violations/${id}/acknowledge`, acknowledgment);
    return response.data;
  }

  // Speed History
  async getSpeedHistory(page: number = 0, size: number = 20): Promise<PagedResponse<SpeedHistory>> {
    const response = await axios.get(`${API_BASE_URL}/history`, {
      params: { page, size }
    });
    return response.data;
  }

  async getSpeedHistoryByVehicle(vehicleId: string, page: number = 0, size: number = 20): Promise<PagedResponse<SpeedHistory>> {
    const response = await axios.get(`${API_BASE_URL}/history/vehicle/${vehicleId}`, {
      params: { page, size }
    });
    return response.data;
  }

  async getSpeedHistoryByDriver(driverId: string, page: number = 0, size: number = 20): Promise<PagedResponse<SpeedHistory>> {
    const response = await axios.get(`${API_BASE_URL}/history/driver/${driverId}`, {
      params: { page, size }
    });
    return response.data;
  }

  async getSpeedViolationHistory(page: number = 0, size: number = 20): Promise<PagedResponse<SpeedHistory>> {
    const response = await axios.get(`${API_BASE_URL}/history/violations`, {
      params: { page, size }
    });
    return response.data;
  }

  // Reports
  async generateReport(request: ReportRequest): Promise<SpeedReport> {
    const response = await axios.post(`${API_BASE_URL}/reports/generate`, null, {
      params: request
    });
    return response.data;
  }

  // Statistics
  async getVehicleViolationStats(vehicleId: string): Promise<SpeedStatistics> {
    const response = await axios.get(`${API_BASE_URL}/statistics/violations/vehicle/${vehicleId}`);
    return response.data;
  }

  async getDriverViolationStats(driverId: string): Promise<SpeedStatistics> {
    const response = await axios.get(`${API_BASE_URL}/statistics/violations/driver/${driverId}`);
    return response.data;
  }

  async getViolationStatsBySeverity(): Promise<ViolationStatistics> {
    const response = await axios.get(`${API_BASE_URL}/statistics/violations/severity`);
    return response.data;
  }

  // Health Check
  async healthCheck(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  }

  // Utility Methods
  getAreaTypeDisplayName(areaType: AreaType): string {
    const displayNames = {
      [AreaType.GENERAL]: 'General',
      [AreaType.BUSINESS_DISTRICT]: 'Business District',
      [AreaType.RESIDENTIAL]: 'Residential',
      [AreaType.SCHOOL_ZONE]: 'School Zone',
      [AreaType.HIGHWAY]: 'Highway',
      [AreaType.CONSTRUCTION_ZONE]: 'Construction Zone',
      [AreaType.HOSPITAL_ZONE]: 'Hospital Zone',
      [AreaType.INDUSTRIAL]: 'Industrial'
    };
    return displayNames[areaType] || areaType;
  }

  getRoadTypeDisplayName(roadType: RoadType): string {
    const displayNames = {
      [RoadType.CITY_STREET]: 'City Street',
      [RoadType.HIGHWAY]: 'Highway',
      [RoadType.RESIDENTIAL]: 'Residential',
      [RoadType.SCHOOL_ZONE]: 'School Zone',
      [RoadType.CONSTRUCTION_ZONE]: 'Construction Zone',
      [RoadType.PARKING_LOT]: 'Parking Lot',
      [RoadType.PRIVATE_ROAD]: 'Private Road'
    };
    return displayNames[roadType] || roadType;
  }

  getViolationSeverityDisplayName(severity: ViolationSeverity): string {
    const displayNames = {
      [ViolationSeverity.MINOR]: 'Minor',
      [ViolationSeverity.MAJOR]: 'Major',
      [ViolationSeverity.SEVERE]: 'Severe',
      [ViolationSeverity.CRITICAL]: 'Critical'
    };
    return displayNames[severity] || severity;
  }

  getViolationSeverityColor(severity: ViolationSeverity): string {
    const colors = {
      [ViolationSeverity.MINOR]: '#10b981',
      [ViolationSeverity.MAJOR]: '#f59e0b',
      [ViolationSeverity.SEVERE]: '#f97316',
      [ViolationSeverity.CRITICAL]: '#ef4444'
    };
    return colors[severity] || '#6b7280';
  }

  getRiskLevelColor(riskLevel: string): string {
    const colors = {
      'LOW': '#10b981',
      'MEDIUM': '#f59e0b',
      'HIGH': '#ef4444'
    };
    return colors[riskLevel] || '#6b7280';
  }

  formatSpeed(speed: number): string {
    return `${speed.toFixed(1)} km/h`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateComplianceRate(totalViolations: number, totalRecords: number): number {
    if (totalRecords === 0) return 100;
    return ((totalRecords - totalViolations) / totalRecords) * 100;
  }

  getRiskLevel(totalViolations: number, severeViolations: number, majorViolations: number): string {
    if (severeViolations > 2 || totalViolations > 10) {
      return 'HIGH';
    } else if (majorViolations > 3 || totalViolations > 5) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }
}

export const speedMonitoringService = new SpeedMonitoringService();