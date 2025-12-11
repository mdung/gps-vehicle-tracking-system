import api from './api';
import {
  OptimizedRoute,
  RouteRequest,
  RouteExecution,
  RouteAnalytics,
  RouteFilters,
  PaginatedResponse
} from '../types/routeOptimization';

class RouteOptimizationService {
  private readonly baseUrl = '/route-optimization';

  // Route Management
  async createRoute(request: RouteRequest): Promise<OptimizedRoute> {
    const response = await api.post(`${this.baseUrl}/routes`, request);
    return response.data;
  }

  async getAllRoutes(
    page: number = 0,
    size: number = 20,
    filters: RouteFilters = {}
  ): Promise<PaginatedResponse<OptimizedRoute>> {
    const params = { page, size, ...filters };
    const response = await api.get(`${this.baseUrl}/routes`, { params });
    return response.data;
  }

  async getRouteById(id: string): Promise<OptimizedRoute> {
    const response = await api.get(`${this.baseUrl}/routes/${id}`);
    return response.data;
  }

  async getRoutesByVehicle(vehicleId: string): Promise<OptimizedRoute[]> {
    const response = await api.get(`${this.baseUrl}/vehicles/${vehicleId}/routes`);
    return response.data;
  }

  async getRoutesByDriver(driverId: string): Promise<OptimizedRoute[]> {
    const response = await api.get(`${this.baseUrl}/drivers/${driverId}/routes`);
    return response.data;
  }

  // Route Execution
  async startRoute(routeId: string): Promise<OptimizedRoute> {
    const response = await api.post(`${this.baseUrl}/routes/${routeId}/start`);
    return response.data;
  }

  async completeRoute(routeId: string): Promise<OptimizedRoute> {
    const response = await api.post(`${this.baseUrl}/routes/${routeId}/complete`);
    return response.data;
  }

  async getRouteExecution(routeId: string): Promise<RouteExecution[]> {
    const response = await api.get(`${this.baseUrl}/routes/${routeId}/execution`);
    return response.data;
  }

  async getRouteAnalytics(routeId: string): Promise<RouteAnalytics> {
    const response = await api.get(`${this.baseUrl}/routes/${routeId}/analytics`);
    return response.data;
  }

  // Utility Methods
  async healthCheck(): Promise<string> {
    const response = await api.get(`${this.baseUrl}/health`);
    return response.data;
  }

  // Helper methods for route optimization
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get optimization type display name
  getOptimizationTypeDisplayName(type: string): string {
    const typeNames: { [key: string]: string } = {
      'SHORTEST_DISTANCE': 'Shortest Distance',
      'FASTEST_TIME': 'Fastest Time',
      'FUEL_EFFICIENT': 'Fuel Efficient',
      'BALANCED': 'Balanced',
      'CUSTOM': 'Custom'
    };
    return typeNames[type] || type;
  }

  // Get route status display name
  getRouteStatusDisplayName(status: string): string {
    const statusNames: { [key: string]: string } = {
      'DRAFT': 'Draft',
      'PLANNED': 'Planned',
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled',
      'PAUSED': 'Paused'
    };
    return statusNames[status] || status;
  }

  // Get stop type display name
  getStopTypeDisplayName(type: string): string {
    const typeNames: { [key: string]: string } = {
      'PICKUP': 'Pickup',
      'DELIVERY': 'Delivery',
      'SERVICE': 'Service',
      'WAYPOINT': 'Waypoint',
      'DEPOT': 'Depot',
      'CUSTOMER': 'Customer',
      'FUEL_STATION': 'Fuel Station',
      'REST_STOP': 'Rest Stop'
    };
    return typeNames[type] || type;
  }

  // Get performance rating color
  getPerformanceRatingColor(rating: string): string {
    const colors: { [key: string]: string } = {
      'Excellent': '#28a745',
      'Good': '#17a2b8',
      'Average': '#ffc107',
      'Below Average': '#fd7e14',
      'Poor': '#dc3545'
    };
    return colors[rating] || '#6c757d';
  }

  // Get route status color
  getRouteStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'DRAFT': '#6c757d',
      'PLANNED': '#17a2b8',
      'IN_PROGRESS': '#ffc107',
      'COMPLETED': '#28a745',
      'CANCELLED': '#dc3545',
      'PAUSED': '#fd7e14'
    };
    return colors[status] || '#6c757d';
  }

  // Get deviation type icon
  getDeviationTypeIcon(deviationType: string): string {
    const icons: { [key: string]: string } = {
      'ON_ROUTE': '✅',
      'MINOR_DEVIATION': '⚠️',
      'MAJOR_DEVIATION': '🚨',
      'OFF_ROUTE': '❌',
      'TRAFFIC_DETOUR': '🚧',
      'EMERGENCY_DETOUR': '🚑'
    };
    return icons[deviationType] || '📍';
  }

  // Format duration
  formatDuration(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }

  // Format distance
  formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  }

  // Format efficiency score
  formatEfficiencyScore(score?: number): string {
    if (score === undefined || score === null) return 'N/A';
    return `${score.toFixed(1)}%`;
  }

  // Calculate route completion percentage
  calculateCompletionPercentage(totalStops: number, completedStops: number): number {
    if (totalStops === 0) return 0;
    return Math.round((completedStops / totalStops) * 100);
  }

  // Parse route coordinates
  parseRouteCoordinates(coordinatesJson?: string): [number, number][] {
    if (!coordinatesJson) return [];
    try {
      return JSON.parse(coordinatesJson);
    } catch (error) {
      console.error('Error parsing route coordinates:', error);
      return [];
    }
  }

  // Parse waypoints
  parseWaypoints(waypointsJson?: string): any[] {
    if (!waypointsJson) return [];
    try {
      return JSON.parse(waypointsJson);
    } catch (error) {
      console.error('Error parsing waypoints:', error);
      return [];
    }
  }
}

export const routeOptimizationService = new RouteOptimizationService();