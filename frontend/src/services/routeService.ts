import api from './api';
import { Route } from '../types/route';

export const routeService = {
  getAll: async (): Promise<Route[]> => {
    const response = await api.get<Route[]>('/routes');
    return response.data;
  },

  getById: async (id: string): Promise<Route> => {
    const response = await api.get<Route>(`/routes/${id}`);
    return response.data;
  },

  getByVehicle: async (vehicleId: string): Promise<Route[]> => {
    const response = await api.get<Route[]>(`/routes/vehicle/${vehicleId}`);
    return response.data;
  },

  endRoute: async (routeId: string, endLocationId: string): Promise<Route> => {
    const response = await api.put<Route>(`/routes/${routeId}/end`, null, {
      params: { endLocationId },
    });
    return response.data;
  },
};

