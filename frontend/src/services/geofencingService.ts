import api from './api';
import {
  Geofence,
  GeofenceRequest,
  GeofenceAlert,
  GeofenceFilters,
  AlertFilters,
  PaginatedResponse
} from '../types/geofencing';

class GeofencingService {
  private readonly baseUrl = '/geofencing';

  // Geofence Management
  async createGeofence(request: GeofenceRequest): Promise<Geofence> {
    const response = await api.post(`${this.baseUrl}/geofences`, request);
    return response.data;
  }

  async getAllGeofences(
    page: number = 0,
    size: number = 20,
    filters: GeofenceFilters = {}
  ): Promise<PaginatedResponse<Geofence>> {
    const params = { page, size, ...filters };
    const response = await api.get(`${this.baseUrl}/geofences`, { params });
    return response.data;
  }

  async getGeofenceById(id: string): Promise<Geofence> {
    const response = await api.get(`${this.baseUrl}/geofences/${id}`);
    return response.data;
  }

  async updateGeofence(id: string, request: GeofenceRequest): Promise<Geofence> {
    const response = await api.put(`${this.baseUrl}/geofences/${id}`, request);
    return response.data;
  }

  async deleteGeofence(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/geofences/${id}`);
  }

  // Vehicle Assignments
  async assignVehicleToGeofence(vehicleId: string, geofenceId: string): Promise<void> {
    await api.post(`${this.baseUrl}/geofences/${geofenceId}/vehicles/${vehicleId}`);
  }

  async unassignVehicleFromGeofence(vehicleId: string, geofenceId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/geofences/${geofenceId}/vehicles/${vehicleId}`);
  }

  async getVehicleGeofences(vehicleId: string): Promise<Geofence[]> {
    const response = await api.get(`${this.baseUrl}/vehicles/${vehicleId}/geofences`);
    return response.data;
  }

  // Alert Management
  async getAllAlerts(
    page: number = 0,
    size: number = 20,
    filters: AlertFilters = {}
  ): Promise<PaginatedResponse<GeofenceAlert>> {
    const params = { page, size, ...filters };
    const response = await api.get(`${this.baseUrl}/alerts`, { params });
    return response.data;
  }

  async getUnacknowledgedAlerts(): Promise<GeofenceAlert[]> {
    const response = await api.get(`${this.baseUrl}/alerts/unacknowledged`);
    return response.data;
  }

  async getVehicleAlerts(
    vehicleId: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<GeofenceAlert>> {
    const response = await api.get(`${this.baseUrl}/vehicles/${vehicleId}/alerts`, {
      params: { page, size }
    });
    return response.data;
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string, notes?: string): Promise<void> {
    const params: any = { acknowledgedBy };
    if (notes) params.notes = notes;
    
    await api.post(`${this.baseUrl}/alerts/${alertId}/acknowledge`, null, { params });
  }

  // Utility Methods
  async healthCheck(): Promise<string> {
    const response = await api.get(`${this.baseUrl}/health`);
    return response.data;
  }

  // Helper methods for geofence calculations
  isPointInCircle(
    pointLat: number,
    pointLng: number,
    centerLat: number,
    centerLng: number,
    radiusMeters: number
  ): boolean {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(pointLat - centerLat);
    const dLng = this.toRadians(pointLng - centerLng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(centerLat)) * Math.cos(this.toRadians(pointLat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance <= radiusMeters;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get geofence type display name
  getGeofenceTypeDisplayName(type: string): string {
    const typeNames: { [key: string]: string } = {
      'AUTHORIZED_AREA': 'Authorized Area',
      'RESTRICTED_AREA': 'Restricted Area',
      'CUSTOMER_LOCATION': 'Customer Location',
      'DEPOT': 'Depot',
      'SERVICE_AREA': 'Service Area',
      'ROUTE_CHECKPOINT': 'Route Checkpoint'
    };
    return typeNames[type] || type;
  }

  // Get alert severity color
  getAlertSeverityColor(severity: string): string {
    const colors: { [key: string]: string } = {
      'LOW': '#28a745',
      'MEDIUM': '#ffc107',
      'HIGH': '#fd7e14',
      'CRITICAL': '#dc3545'
    };
    return colors[severity] || '#6c757d';
  }

  // Get alert type icon
  getAlertTypeIcon(alertType: string): string {
    const icons: { [key: string]: string } = {
      'ENTRY': '🟢',
      'EXIT': '🔴',
      'UNAUTHORIZED_ENTRY': '⚠️',
      'ROUTE_DEVIATION': '🔄',
      'SPEEDING_IN_ZONE': '⚡',
      'EXTENDED_STAY': '⏰'
    };
    return icons[alertType] || '📍';
  }
}

export const geofencingService = new GeofencingService();