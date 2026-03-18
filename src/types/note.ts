export interface Note {
  id: number;
  taskId: number;
  userId: number;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteCreate {
  title: string;
  content?: string;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
}

export interface NotesResponse {
  success: boolean;
  data: Note[];
  message?: string;
}

export interface NoteResponse {
  success: boolean;
  data: Note;
  message: string;
}
