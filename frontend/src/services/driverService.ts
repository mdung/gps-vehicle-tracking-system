import api from './api';
import { Driver, DriverRequest } from '../types/driver';

export const driverService = {
  getAll: async (): Promise<Driver[]> => {
    const response = await api.get<Driver[]>('/drivers');
    return response.data;
  },

  getById: async (id: string): Promise<Driver> => {
    const response = await api.get<Driver>(`/drivers/${id}`);
    return response.data;
  },

  create: async (data: DriverRequest): Promise<Driver> => {
    const response = await api.post<Driver>('/drivers', data);
    return response.data;
  },

  update: async (id: string, data: DriverRequest): Promise<Driver> => {
    const response = await api.put<Driver>(`/drivers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/drivers/${id}`);
  },
};



