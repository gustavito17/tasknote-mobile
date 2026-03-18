import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';
import { authApi, apiClient } from '../api';
import storage from '../storage';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_ERROR'; payload: string };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_ERROR':
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuth = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = await apiClient.getToken();
      
      if (!token) {
        dispatch({ type: 'CLEAR_USER' });
        return;
      }

      const cachedUser = await storage.getUser();
      if (cachedUser) {
        dispatch({ type: 'SET_USER', payload: { user: cachedUser, token } });
      }

      const response = await authApi.getCurrentUser();
      if (response.success) {
        await storage.setUser(response.data);
        dispatch({ type: 'SET_USER', payload: { user: response.data, token } });
      } else {
        await apiClient.clearToken();
        dispatch({ type: 'CLEAR_USER' });
      }
    } catch (error) {
      console.log('[Auth] Check auth failed:', error);
      await apiClient.clearToken();
      dispatch({ type: 'CLEAR_USER' });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authApi.login(credentials);
      
      if (response.success) {
        await apiClient.setToken(response.data.token);
        await storage.setUser(response.data.user);
        dispatch({ type: 'SET_USER', payload: response.data });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: '' });
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authApi.register(credentials);
      
      if (response.success) {
        await apiClient.setToken(response.data.token);
        await storage.setUser(response.data.user);
        dispatch({ type: 'SET_USER', payload: response.data });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: '' });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.clearToken();
      await storage.clearAll();
      dispatch({ type: 'CLEAR_USER' });
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
