import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Task, TaskCreate, TaskUpdate, TaskStatus, LoadingState } from '../types';
import { taskApi, GetTasksParams } from '../api';
import storage from '../storage';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: LoadingState;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

interface TaskContextType extends TaskState {
  fetchTasks: (params?: GetTasksParams) => Promise<void>;
  fetchTaskById: (id: number) => Promise<void>;
  createTask: (data: TaskCreate) => Promise<Task>;
  updateTask: (id: number, data: TaskUpdate) => Promise<void>;
  updateTaskStatus: (id: number, status: TaskStatus) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  clearError: () => void;
}

type TaskAction =
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'SET_TASKS'; payload: { tasks: Task[]; pagination?: any } }
  | { type: 'SET_CURRENT_TASK'; payload: Task | null }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'SET_ERROR'; payload: string };

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  isLoading: 'idle',
  error: null,
  pagination: { page: 1, totalPages: 1, total: 0 },
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload.tasks,
        pagination: action.payload.pagination || state.pagination,
        isLoading: 'succeeded',
      };
    case 'SET_CURRENT_TASK':
      return { ...state, currentTask: action.payload, isLoading: 'succeeded' };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t)),
        currentTask: state.currentTask?.id === action.payload.id ? action.payload : state.currentTask,
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
        currentTask: state.currentTask?.id === action.payload ? null : state.currentTask,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: 'failed' };
    default:
      return state;
  }
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchTasks = useCallback(async (params?: GetTasksParams) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: 'loading' });
      const response = await taskApi.getAll(params);
      
      if (response.success) {
        dispatch({
          type: 'SET_TASKS',
          payload: {
            tasks: response.data,
            pagination: response.pagination,
          },
        });
        await storage.setTasks(response.data);
      }
    } catch (error: any) {
      console.error('[Tasks] Fetch error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      const cachedTasks = await storage.getTasks();
      dispatch({ type: 'SET_TASKS', payload: { tasks: cachedTasks } });
    }
  }, []);

  const fetchTaskById = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: 'loading' });
      const response = await taskApi.getById(id);
      
      if (response.success) {
        dispatch({ type: 'SET_CURRENT_TASK', payload: response.data });
      }
    } catch (error: any) {
      console.error('[Tasks] Fetch by id error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const createTask = useCallback(async (data: TaskCreate): Promise<Task> => {
    dispatch({ type: 'SET_LOADING', payload: 'loading' });
    const response = await taskApi.create(data);
    
    if (response.success) {
      dispatch({ type: 'ADD_TASK', payload: response.data });
      return response.data;
    }
    throw new Error('Failed to create task');
  }, []);

  const updateTask = useCallback(async (id: number, data: TaskUpdate) => {
    const response = await taskApi.update(id, data);
    
    if (response.success) {
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
    }
  }, []);

  const updateTaskStatus = useCallback(async (id: number, status: TaskStatus) => {
    const response = await taskApi.updateStatus(id, { status });
    
    if (response.success) {
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    await taskApi.delete(id);
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: '' });
  }, []);

  const value: TaskContextType = {
    ...state,
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    clearError,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextType {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
