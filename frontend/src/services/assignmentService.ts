import api from './api';
import { Assignment, AssignmentRequest } from '../types/assignment';

export const assignmentService = {
  assign: async (data: AssignmentRequest): Promise<Assignment> => {
    const response = await api.post<Assignment>('/assignments', data);
    return response.data;
  },

  unassign: async (id: string): Promise<void> => {
    await api.delete(`/assignments/${id}`);
  },

  getByVehicle: async (vehicleId: string): Promise<Assignment> => {
    const response = await api.get<Assignment>(`/assignments/vehicle/${vehicleId}`);
    return response.data;
  },

  getByDriver: async (driverId: string): Promise<Assignment> => {
    const response = await api.get<Assignment>(`/assignments/driver/${driverId}`);
    return response.data;
  },
};

