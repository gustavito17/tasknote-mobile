export * from './auth';
export * from './task';
export * from './note';

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface SyncStatus {
  isOnline: boolean;
  lastSyncAt: string | null;
  pendingChanges: number;
}
