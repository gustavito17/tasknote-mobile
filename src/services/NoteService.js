import axios from 'axios';

const API_BASE_URL = 'https://tu-api-placeholder.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  console.log(`[NoteService] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

export const NoteService = {
  getAll: async () => {
    const response = await api.get('/notes');
    return response.data;
  },

  create: async (note) => {
    const response = await api.post('/notes', note);
    return response.data;
  },

  update: async (id, note) => {
    const response = await api.put(`/notes/${id}`, note);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};

export default NoteService;
