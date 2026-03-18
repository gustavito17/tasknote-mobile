import apiClient from './client';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../types';

export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.instance.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.instance.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.instance.get('/auth/me');
    return response.data;
  },
};
