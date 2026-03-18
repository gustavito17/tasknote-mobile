import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Note, User } from '../types';

const STORAGE_KEYS = {
  USER: '@TaskNote:user',
  TASKS: '@TaskNote:tasks',
  NOTES: '@TaskNote:notes',
  PENDING_TASKS: '@TaskNote:pendingTasks',
  PENDING_NOTES: '@TaskNote:pendingNotes',
  LAST_SYNC: '@TaskNote:lastSync',
};

export const storage = {
  async setUser(user: User | null): Promise<void> {
    try {
      if (user) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (error) {
      console.error('[Storage] Error saving user:', error);
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[Storage] Error reading user:', error);
      return null;
    }
  },

  async setTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('[Storage] Error saving tasks:', error);
    }
  },

  async getTasks(): Promise<Task[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Storage] Error reading tasks:', error);
      return [];
    }
  },

  async setNotes(notes: Note[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (error) {
      console.error('[Storage] Error saving notes:', error);
    }
  },

  async getNotes(): Promise<Note[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Storage] Error reading notes:', error);
      return [];
    }
  },

  async addPendingTask(operation: { type: 'create' | 'update' | 'delete'; data: any }): Promise<void> {
    try {
      const pending = await this.getPendingTasks();
      pending.push({ ...operation, timestamp: Date.now() });
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_TASKS, JSON.stringify(pending));
    } catch (error) {
      console.error('[Storage] Error adding pending task:', error);
    }
  },

  async getPendingTasks(): Promise<Array<{ type: string; data: any; timestamp: number }>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_TASKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Storage] Error reading pending tasks:', error);
      return [];
    }
  },

  async clearPendingTasks(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_TASKS);
    } catch (error) {
      console.error('[Storage] Error clearing pending tasks:', error);
    }
  },

  async addPendingNote(operation: { type: 'create' | 'update' | 'delete'; data: any }): Promise<void> {
    try {
      const pending = await this.getPendingNotes();
      pending.push({ ...operation, timestamp: Date.now() });
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_NOTES, JSON.stringify(pending));
    } catch (error) {
      console.error('[Storage] Error adding pending note:', error);
    }
  },

  async getPendingNotes(): Promise<Array<{ type: string; data: any; timestamp: number }>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_NOTES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Storage] Error reading pending notes:', error);
      return [];
    }
  },

  async clearPendingNotes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_NOTES);
    } catch (error) {
      console.error('[Storage] Error clearing pending notes:', error);
    }
  },

  async setLastSync(timestamp: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('[Storage] Error saving last sync:', error);
    }
  },

  async getLastSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('[Storage] Error reading last sync:', error);
      return null;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.TASKS,
        STORAGE_KEYS.NOTES,
        STORAGE_KEYS.PENDING_TASKS,
        STORAGE_KEYS.PENDING_NOTES,
        STORAGE_KEYS.LAST_SYNC,
      ]);
    } catch (error) {
      console.error('[Storage] Error clearing all:', error);
    }
  },
};

export default storage;
