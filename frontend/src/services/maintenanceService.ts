import api from './api';
import {
  MaintenanceType,
  MaintenanceSchedule,
  MaintenanceRecord,
  MaintenanceReminder,
  MaintenanceCost,
  MaintenanceAnalytics,
  CreateMaintenanceTypeRequest,
  CreateMaintenanceScheduleRequest,
  CreateMaintenanceRecordRequest,
  CreateMaintenanceCostRequest,
  MaintenanceCategory,
  MaintenanceStatus,
  MaintenancePriority
} from '../types/maintenance';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

class MaintenanceService {
  // ===== MAINTENANCE TYPES =====
  
  async getMaintenanceTypes(page = 0, size = 20): Promise<PaginatedResponse<MaintenanceType>> {
    const response = await api.get(`/maintenance/types?page=${page}&size=${size}`);
    return response.data;
  }
  
  async getAllActiveMaintenanceTypes(): Promise<MaintenanceType[]> {
    const response = await api.get('/maintenance/types/active');
    return response.data;
  }
  
  async getMaintenanceTypeById(id: string): Promise<MaintenanceType> {
    const response = await api.get(`/maintenance/types/${id}`);
    return response.data;
  }
  
  async getMaintenanceTypesByCategory(category: MaintenanceCategory): Promise<MaintenanceType[]> {
    const response = await api.get(`/maintenance/types/category/${category}`);
    return response.data;
  }
  
  async searchMaintenanceTypes(searchTerm: string, page = 0, size = 20): Promise<PaginatedResponse<MaintenanceType>> {
    const response = await api.get(`/maintenance/types/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}`);
    return response.data;
  }
  
  async createMaintenanceType(data: CreateMaintenanceTypeRequest): Promise<MaintenanceType> {
    const response = await api.post('/maintenance/types', data);
    return response.data;
  }
  
  async updateMaintenanceType(id: string, data: Partial<CreateMaintenanceTypeRequest>): Promise<MaintenanceType> {
    const response = await api.put(`/maintenance/types/${id}`, data);
    return response.data;
  }
  
  async deleteMaintenanceType(id: string): Promise<void> {
    await api.delete(`/maintenance/types/${id}`);
  }
  
  // ===== MAINTENANCE SCHEDULES =====
  
  async getMaintenanceSchedules(page = 0, size = 20): Promise<PaginatedResponse<MaintenanceSchedule>> {
    const response = await api.get(`/maintenance/schedules?page=${page}&size=${size}`);
    return response.data;
  }
  
  async getMaintenanceSchedulesByVehicle(vehicleId: string, page = 0, size = 20): Promise<PaginatedResponse<MaintenanceSchedule>> {
    const response = await api.get(`/maintenance/schedules/vehicle/${vehicleId}?page=${page}&size=${size}`);
    return response.data;
  }
  
  async getActiveSchedulesByVehicle(vehicleId: string): Promise<MaintenanceSchedule[]> {
    const response = await api.get(`/maintenance/schedules/vehicle/${vehicleId}/active`);
    return response.data;
  }
  
  async getMaintenanceScheduleById(id: string): Promise<MaintenanceSchedule> {
    const response = await api.get(`/maintenance/schedules/${id}`);
    return response.data;
  }
  
  async getDueSchedules(date: string): Promise<MaintenanceSchedule[]> {
    const response = await api.get(`/maintenance/schedules/due?date=${date}`);
    return response.data;
  }
  
  async getOverdueSchedules(): Promise<MaintenanceSchedule[]> {
    const response = await api.get('/maintenance/schedules/overdue');
    return response.data;
  }
  
  async getSchedulesDueBetween(startDate: string, endDate: string): Promise<MaintenanceSchedule[]> {
    const response = await api.get(`/maintenance/schedules/due-between?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }
  
  async createMaintenanceSchedule(data: CreateMaintenanceScheduleRequest): Promise<MaintenanceSchedule> {
    const response = await api.post('/maintenance/schedules', data);
    return response.data;
  }
  
  async updateMaintenanceSchedule(id: string, data: Partial<CreateMaintenanceScheduleRequest>): Promise<MaintenanceSchedule> {
    const response = await api.put(`/maintenance/schedules/${id}`, data);
    return response.data;
  }
  
  async deleteMaintenanceSchedule(id: string): Promise<void> {
    await api.delete(`/maintenance/schedules/${id}`);
  }
  
  // ===== MAINTENANCE RECORDS =====
  
  async getMaintenanceRecords(page = 0, size = 20): Promise<PaginatedResponse<MaintenanceRecord>> {
    const response = await api.get(`/maintenance/records?page=${page}&size=${size}`);
    return response.data;
  }
  
  async getMaintenanceRecordsByVehicle(vehicleId: string, page = 0, size = 20): Promise<PaginatedResponse<MaintenanceRecord>> {
    const response = await api.get(`/maintenance/records/vehicle/${vehicleId}?page=${page}&size=${size}`);
    return response.data;
  }
  
  async getMaintenanceHistoryByVehicle(vehicleId: string): Promise<MaintenanceRecord[]> {
    const response = await api.get(`/maintenance/records/vehicle/${vehicleId}/history`);
    return response.data;
  }
  
  async getMaintenanceRecordById(id: string): Promise<MaintenanceRecord> {
    const response = await api.get(`/maintenance/records/${id}`);
    return response.data;
  }
  
  async getMaintenanceRecordsByDateRange(startDate: string, endDate: string, page = 0, size = 20): Promise<PaginatedResponse<MaintenanceRecord>> {
    const response = await api.get(`/maintenance/records/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`);
    return response.data;
  }
  
  async getMaintenanceRecordsByStatus(status: MaintenanceStatus, page = 0, size = 20): Promise<PaginatedResponse<MaintenanceRecord>> {
    const response = await api.get(`/maintenance/records/status/${status}?page=${page}&size=${size}`);
    return response.data;
  }
  
  async createMaintenanceRecord(data: CreateMaintenanceRecordRequest): Promise<MaintenanceRecord> {
    const response = await api.post('/maintenance/records', data);
    return response.data;
  }
  
  async updateMaintenanceRecord(id: string, data: Partial<CreateMaintenanceRecordRequest>): Promise<MaintenanceRecord> {
    const response = await api.put(`/maintenance/records/${id}`, data);
    return response.data;
  }
  
  async deleteMaintenanceRecord(id: string): Promise<void> {
    await api.delete(`/maintenance/records/${id}`);
  }
  
  // ===== MAINTENANCE REMINDERS =====
  
  async getMaintenanceReminders(page = 0, size = 20): Promise<PaginatedResponse<MaintenanceReminder>> {
    const response = await api.get(`/maintenance/reminders?page=${page}&size=${size}`);
    return response.data;
  }
  
  async getUnacknowledgedReminders(): Promise<MaintenanceReminder[]> {
    const response = await api.get('/maintenance/reminders/unacknowledged');
    return response.data;
  }
  
  async getOverdueReminders(): Promise<MaintenanceReminder[]> {
    const response = await api.get('/maintenance/reminders/overdue');
    return response.data;
  }
  
  async getUpcomingReminders(days = 30): Promise<MaintenanceReminder[]> {
    const response = await api.get(`/maintenance/reminders/upcoming?days=${days}`);
    return response.data;
  }
  
  async getRemindersByVehicle(vehicleId: string): Promise<MaintenanceReminder[]> {
    const response = await api.get(`/maintenance/reminders/vehicle/${vehicleId}`);
    return response.data;
  }
  
  async acknowledgeReminder(id: string, acknowledgedBy: string): Promise<MaintenanceReminder> {
    const response = await api.put(`/maintenance/reminders/${id}/acknowledge?acknowledgedBy=${encodeURIComponent(acknowledgedBy)}`);
    return response.data;
  }
  
  // ===== MAINTENANCE COSTS =====
  
  async getCostsByMaintenanceRecord(recordId: string): Promise<MaintenanceCost[]> {
    const response = await api.get(`/maintenance/costs/record/${recordId}`);
    return response.data;
  }
  
  async createMaintenanceCost(data: CreateMaintenanceCostRequest): Promise<MaintenanceCost> {
    const response = await api.post('/maintenance/costs', data);
    return response.data;
  }
  
  async updateMaintenanceCost(id: string, data: Partial<CreateMaintenanceCostRequest>): Promise<MaintenanceCost> {
    const response = await api.put(`/maintenance/costs/${id}`, data);
    return response.data;
  }
  
  async deleteMaintenanceCost(id: string): Promise<void> {
    await api.delete(`/maintenance/costs/${id}`);
  }
  
  // ===== ANALYTICS AND REPORTS =====
  
  async getTotalMaintenanceCostByVehicle(vehicleId: string, startDate: string, endDate: string): Promise<number> {
    const response = await api.get(`/maintenance/analytics/cost/vehicle/${vehicleId}?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }
  
  async getTotalMaintenanceCostByDateRange(startDate: string, endDate: string): Promise<number> {
    const response = await api.get(`/maintenance/analytics/cost/total?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }
  
  async getMaintenanceCountByVehicle(vehicleId: string): Promise<number> {
    const response = await api.get(`/maintenance/analytics/count/vehicle/${vehicleId}`);
    return response.data;
  }
  
  async getUnacknowledgedReminderCount(): Promise<number> {
    const response = await api.get('/maintenance/analytics/reminders/unacknowledged/count');
    return response.data;
  }
  
  async getDistinctSuppliers(): Promise<string[]> {
    const response = await api.get('/maintenance/analytics/suppliers');
    return response.data;
  }
  
  // ===== BATCH OPERATIONS =====
  
  async generateRemindersForAllSchedules(): Promise<void> {
    await api.post('/maintenance/batch/generate-reminders');
  }
  
  async updateOverdueReminders(): Promise<void> {
    await api.post('/maintenance/batch/update-overdue-reminders');
  }
  
  // ===== UTILITY METHODS =====
  
  async getMaintenanceAnalytics(vehicleId?: string, startDate?: string, endDate?: string): Promise<MaintenanceAnalytics> {
    const promises = [
      this.getUnacknowledgedReminderCount(),
      this.getOverdueReminders(),
      this.getUpcomingReminders(30),
      this.getDistinctSuppliers()
    ];
    
    if (vehicleId && startDate && endDate) {
      promises.push(
        this.getTotalMaintenanceCostByVehicle(vehicleId, startDate, endDate),
        this.getMaintenanceCountByVehicle(vehicleId)
      );
    } else if (startDate && endDate) {
      promises.push(this.getTotalMaintenanceCostByDateRange(startDate, endDate));
    }
    
    const [
      unacknowledgedReminders,
      overdueReminders,
      upcomingReminders,
      suppliers,
      totalCost = 0,
      maintenanceCount = 0
    ] = await Promise.all(promises);
    
    return {
      totalCost: totalCost as number,
      maintenanceCount: maintenanceCount as number,
      unacknowledgedReminders: unacknowledgedReminders as number,
      overdueReminders: (overdueReminders as MaintenanceReminder[]).length,
      upcomingReminders: (upcomingReminders as MaintenanceReminder[]).length,
      costByCategory: {},
      costByMonth: {},
      suppliers: suppliers as string[]
    };
  }
}

export const maintenanceService = new MaintenanceService();