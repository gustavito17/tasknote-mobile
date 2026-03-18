import apiClient from './client';
import { Note, NotesResponse, NoteResponse, NoteCreate, NoteUpdate } from '../types';

export const noteApi = {
  getByTaskId: async (taskId: number): Promise<NotesResponse> => {
    const response = await apiClient.instance.get<NotesResponse>(`/tasks/${taskId}/notes`);
    return response.data;
  },

  getById: async (id: number): Promise<NoteResponse> => {
    const response = await apiClient.instance.get<NoteResponse>(`/notes/${id}`);
    return response.data;
  },

  create: async (taskId: number, data: NoteCreate): Promise<NoteResponse> => {
    const response = await apiClient.instance.post<NoteResponse>(`/tasks/${taskId}/notes`, data);
    return response.data;
  },

  update: async (id: number, data: NoteUpdate): Promise<NoteResponse> => {
    const response = await apiClient.instance.put<NoteResponse>(`/notes/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.instance.delete(`/notes/${id}`);
    return response.data;
  },
};
