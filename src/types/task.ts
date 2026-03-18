export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface TaskCreate {
  title: string;
  description?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
}

export interface TaskStatusUpdate {
  status: TaskStatus;
}

export interface TasksResponse {
  success: boolean;
  data: Task[];
  pagination?: Pagination;
  message?: string;
}

export interface TaskResponse {
  success: boolean;
  data: Task;
  message: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
