import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Note, NoteCreate, NoteUpdate, LoadingState } from '../types';
import { noteApi } from '../api';
import storage from '../storage';

interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: LoadingState;
  error: string | null;
}

interface NoteContextType extends NoteState {
  fetchNotesByTaskId: (taskId: number) => Promise<void>;
  fetchNoteById: (id: number) => Promise<void>;
  createNote: (taskId: number, data: NoteCreate) => Promise<Note>;
  updateNote: (id: number, data: NoteUpdate) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  clearCurrentNote: () => void;
  clearError: () => void;
}

type NoteAction =
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'SET_CURRENT_NOTE'; payload: Note | null }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: number }
  | { type: 'SET_ERROR'; payload: string };

const initialState: NoteState = {
  notes: [],
  currentNote: null,
  isLoading: 'idle',
  error: null,
};

function noteReducer(state: NoteState, action: NoteAction): NoteState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload, isLoading: 'succeeded' };
    case 'SET_CURRENT_NOTE':
      return { ...state, currentNote: action.payload, isLoading: 'succeeded' };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((n) => (n.id === action.payload.id ? action.payload : n)),
        currentNote: state.currentNote?.id === action.payload.id ? action.payload : state.currentNote,
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.payload),
        currentNote: state.currentNote?.id === action.payload ? null : state.currentNote,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: 'failed' };
    default:
      return state;
  }
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(noteReducer, initialState);

  const fetchNotesByTaskId = useCallback(async (taskId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: 'loading' });
      const response = await noteApi.getByTaskId(taskId);
      
      if (response.success) {
        dispatch({ type: 'SET_NOTES', payload: response.data });
        await storage.setNotes(response.data);
      }
    } catch (error: any) {
      console.error('[Notes] Fetch by task id error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      const cachedNotes = await storage.getNotes();
      dispatch({ type: 'SET_NOTES', payload: cachedNotes });
    }
  }, []);

  const fetchNoteById = useCallback(async (id: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: 'loading' });
      const response = await noteApi.getById(id);
      
      if (response.success) {
        dispatch({ type: 'SET_CURRENT_NOTE', payload: response.data });
      }
    } catch (error: any) {
      console.error('[Notes] Fetch by id error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const createNote = useCallback(async (taskId: number, data: NoteCreate): Promise<Note> => {
    dispatch({ type: 'SET_LOADING', payload: 'loading' });
    const response = await noteApi.create(taskId, data);
    
    if (response.success) {
      dispatch({ type: 'ADD_NOTE', payload: response.data });
      return response.data;
    }
    throw new Error('Failed to create note');
  }, []);

  const updateNote = useCallback(async (id: number, data: NoteUpdate) => {
    const response = await noteApi.update(id, data);
    
    if (response.success) {
      dispatch({ type: 'UPDATE_NOTE', payload: response.data });
    }
  }, []);

  const deleteNote = useCallback(async (id: number) => {
    await noteApi.delete(id);
    dispatch({ type: 'DELETE_NOTE', payload: id });
  }, []);

  const clearCurrentNote = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_NOTE', payload: null });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: '' });
  }, []);

  const value: NoteContextType = {
    ...state,
    fetchNotesByTaskId,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote,
    clearCurrentNote,
    clearError,
  };

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}

export function useNotes(): NoteContextType {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
}
