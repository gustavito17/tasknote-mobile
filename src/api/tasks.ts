import apiClient from './client';
import {
  Task,
  TasksResponse,
  TaskResponse,
  TaskCreate,
  TaskUpdate,
  TaskStatusUpdate,
} from '../types';

export interface GetTasksParams {
  status?: 'pending' | 'completed';
  page?: number;
  limit?: number;
}

export const taskApi = {
  getAll: async (params?: GetTasksParams): Promise<TasksResponse> => {
    const response = await apiClient.instance.get<TasksResponse>('/tasks', { params });
    return response.data;
  },

  getById: async (id: number): Promise<TaskResponse> => {
    const response = await apiClient.instance.get<TaskResponse>(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: TaskCreate): Promise<TaskResponse> => {
    const response = await apiClient.instance.post<TaskResponse>('/tasks', data);
    return response.data;
  },

  update: async (id: number, data: TaskUpdate): Promise<TaskResponse> => {
    const response = await apiClient.instance.put<TaskResponse>(`/tasks/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: number, data: TaskStatusUpdate): Promise<TaskResponse> => {
    const response = await apiClient.instance.patch<TaskResponse>(`/tasks/${id}/status`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.instance.delete(`/tasks/${id}`);
    return response.data;
  },
};
