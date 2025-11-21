import api from './api';
import { Vehicle, VehicleRequest } from '../types/vehicle';

export const vehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await api.get<Vehicle[]>('/vehicles');
    return response.data;
  },

  getById: async (id: string): Promise<Vehicle> => {
    const response = await api.get<Vehicle>(`/vehicles/${id}`);
    return response.data;
  },

  create: async (data: VehicleRequest): Promise<Vehicle> => {
    const response = await api.post<Vehicle>('/vehicles', data);
    return response.data;
  },

  update: async (id: string, data: VehicleRequest): Promise<Vehicle> => {
    const response = await api.put<Vehicle>(`/vehicles/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },
};

