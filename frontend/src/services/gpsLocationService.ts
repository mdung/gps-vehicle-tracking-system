import api from './api';
import { GpsLocation, GpsLocationRequest } from '../types/gpsLocation';

export const gpsLocationService = {
  create: async (data: GpsLocationRequest): Promise<GpsLocation> => {
    const response = await api.post<GpsLocation>('/gps-locations', data);
    return response.data;
  },

  getByVehicle: async (vehicleId: string): Promise<GpsLocation[]> => {
    const response = await api.get<GpsLocation[]>(`/gps-locations/vehicle/${vehicleId}`);
    return response.data;
  },

  getLatest: async (vehicleId: string): Promise<GpsLocation> => {
    const response = await api.get<GpsLocation>(`/gps-locations/vehicle/${vehicleId}/latest`);
    return response.data;
  },

  getHistory: async (vehicleId: string, startTime: string, endTime: string): Promise<GpsLocation[]> => {
    const response = await api.get<GpsLocation[]>(`/gps-locations/vehicle/${vehicleId}/history`, {
      params: { startTime, endTime },
    });
    return response.data;
  },
};

