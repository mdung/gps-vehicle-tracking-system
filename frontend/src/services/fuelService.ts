import api from './api';
import {
  FuelRecord,
  FuelRecordRequest,
  FuelEfficiency,
  FuelReport,
  FuelFilters
} from '../types/fuel';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

class FuelService {
  private readonly baseUrl = '/fuel';

  // Fuel Records
  async createFuelRecord(request: FuelRecordRequest): Promise<FuelRecord> {
    const response = await api.post(`${this.baseUrl}/records`, request);
    return response.data;
  }

  async getFuelRecordsByVehicle(
    vehicleId: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<FuelRecord>> {
    const response = await api.get(`${this.baseUrl}/records/vehicle/${vehicleId}`, {
      params: { page, size }
    });
    return response.data;
  }

  async getFuelRecordsByDriver(
    driverId: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<FuelRecord>> {
    const response = await api.get(`${this.baseUrl}/records/driver/${driverId}`, {
      params: { page, size }
    });
    return response.data;
  }

  async getAllFuelRecords(
    filters: FuelFilters = {},
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<FuelRecord>> {
    const params = {
      page,
      size,
      ...filters
    };
    
    const response = await api.get(`${this.baseUrl}/records`, { params });
    return response.data;
  }

  // Fuel Efficiency
  async calculateFuelEfficiency(
    vehicleId: string,
    startDate: string,
    endDate: string
  ): Promise<FuelEfficiency> {
    const response = await api.post(`${this.baseUrl}/efficiency/calculate/${vehicleId}`, null, {
      params: { startDate, endDate }
    });
    return response.data;
  }

  async getVehicleEfficiencyHistory(
    vehicleId: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<FuelEfficiency>> {
    const response = await api.get(`${this.baseUrl}/efficiency/vehicle/${vehicleId}`, {
      params: { page, size }
    });
    return response.data;
  }

  async getDriverEfficiencyHistory(
    driverId: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<FuelEfficiency>> {
    const response = await api.get(`${this.baseUrl}/efficiency/driver/${driverId}`, {
      params: { page, size }
    });
    return response.data;
  }

  // Reports
  async generateFuelReport(startDate: string, endDate: string): Promise<FuelReport> {
    const response = await api.get(`${this.baseUrl}/reports`, {
      params: { startDate, endDate }
    });
    return response.data;
  }

  // Utility methods
  async getFuelTypes(): Promise<string[]> {
    // This could be from a configuration endpoint or hardcoded
    return ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'CNG'];
  }

  async getFuelStations(): Promise<string[]> {
    // This could be from a configuration endpoint or hardcoded
    return ['Shell', 'BP', 'Exxon', 'Chevron', 'Total', 'Petrobras', 'Other'];
  }

  // Analytics methods
  async getTopFuelConsumingVehicles(
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/analytics/top-consuming-vehicles`, {
      params: { startDate, endDate, limit }
    });
    return response.data;
  }

  async getLeastEfficientVehicles(
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/analytics/least-efficient-vehicles`, {
      params: { startDate, endDate, limit }
    });
    return response.data;
  }

  async getFuelCostTrends(
    startDate: string,
    endDate: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<any[]> {
    const response = await api.get(`${this.baseUrl}/analytics/cost-trends`, {
      params: { startDate, endDate, groupBy }
    });
    return response.data;
  }

  async getEfficiencyTrends(
    vehicleId?: string,
    driverId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    const params: any = {};
    if (vehicleId) params.vehicleId = vehicleId;
    if (driverId) params.driverId = driverId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get(`${this.baseUrl}/analytics/efficiency-trends`, { params });
    return response.data;
  }
}

export const fuelService = new FuelService();