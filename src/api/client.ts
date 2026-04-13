import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const STORAGE_TOKEN_KEY = 'TaskNote.authToken';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  'https://tasknote-api.onrender.com/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (!this.token) {
          try {
            this.token = await SecureStore.getItemAsync(STORAGE_TOKEN_KEY);
          } catch (error) {
            console.log('[API] Error reading token:', error);
          }
        }

        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: AxiosError) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response ${response.status}:`, response.config.url);
        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          console.log('[API] Unauthorized - clearing token');
          await this.clearToken();
        }
        
        console.error('[API] Response error:', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
        });
        
        return Promise.reject(error);
      }
    );
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
    try {
      await SecureStore.setItemAsync(STORAGE_TOKEN_KEY, token);
    } catch (error) {
      console.error('[API] Error saving token:', error);
    }
  }

  async clearToken(): Promise<void> {
    this.token = null;
    try {
      await SecureStore.deleteItemAsync(STORAGE_TOKEN_KEY);
    } catch (error) {
      console.error('[API] Error clearing token:', error);
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      try {
        this.token = await SecureStore.getItemAsync(STORAGE_TOKEN_KEY);
      } catch (error) {
        console.error('[API] Error reading token:', error);
      }
    }
    return this.token;
  }

  async warmUp(): Promise<void> {
    try {
      await this.client.get('/auth/me', { timeout: 60000 });
    } catch {
      // Expected to fail (no token) — we only care about waking the server
    }
  }

  get instance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
