export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  cid?: string;
}

export interface EncryptedNote {
  id: string;
  title: string;
  cid: string;
  createdAt: number;
  updatedAt: number;
}

export interface StoredNoteData {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}
