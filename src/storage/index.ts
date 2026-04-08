import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Note, User } from '../types';

export interface UserCategory {
  id: string;
  label: string;
  color: string;
}

const STORAGE_KEYS = {
  USER: '@GusPad:user',
  TASKS: '@GusPad:tasks',
  NOTES: '@GusPad:notes',
  PENDING_TASKS: '@GusPad:pendingTasks',
  PENDING_NOTES: '@GusPad:pendingNotes',
  LAST_SYNC: '@GusPad:lastSync',
  TASK_CATEGORIES_MAP: '@GusPad:taskCategoriesMap',
  USER_CATEGORIES: '@GusPad:userCategories',
};

const DEFAULT_CATEGORIES: UserCategory[] = [
  { id: 'trabajo', label: 'Trabajo', color: '#4FC3F7' },
  { id: 'personal', label: 'Personal', color: '#CE93D8' },
  { id: 'hogar', label: 'Hogar', color: '#FFCC80' },
];

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

  // ── User-defined categories ─────────────────────────────────────────────────

  async getUserCategories(): Promise<UserCategory[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  async setUserCategories(categories: UserCategory[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('[Storage] Error saving user categories:', error);
    }
  },

  // ── Task → category assignment ──────────────────────────────────────────────

  async getTaskCategoryMap(): Promise<Record<number, string>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TASK_CATEGORIES_MAP);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  async setTaskCategory(taskId: number, categoryId: string | null): Promise<void> {
    try {
      const map = await this.getTaskCategoryMap();
      if (categoryId === null) {
        delete map[taskId];
      } else {
        map[taskId] = categoryId;
      }
      await AsyncStorage.setItem(STORAGE_KEYS.TASK_CATEGORIES_MAP, JSON.stringify(map));
    } catch (error) {
      console.error('[Storage] Error saving task category:', error);
    }
  },

  // ── Misc ────────────────────────────────────────────────────────────────────

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
    } catch {
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
    } catch {
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
    } catch {
      return null;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('[Storage] Error clearing all:', error);
    }
  },
};

export default storage;
