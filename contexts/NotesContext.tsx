import { EncryptionService } from "@/services/encryptionService";
import { IPFSService } from "@/services/ipfsService";
import { EncryptedNote, Note, StoredNoteData } from "@/types/note";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";
import { useWallet } from "./WalletContext";

const NOTES_STORAGE_KEY = "encrypted_notes";
const IPFS_TOKEN_KEY = "ipfs_api_token";

export const [NotesProvider, useNotes] = createContextHook(() => {
  const { isConnected, getEncryptionSignature } = useWallet();
  const [notes, setNotes] = useState<EncryptedNote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ipfsToken, setIpfsToken] = useState<string>("");

  const loadNotes = useCallback(async () => {
    console.log("[NotesContext] Loading notes...");
    setIsLoading(true);

    try {
      const stored = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (stored) {
        const parsedNotes: EncryptedNote[] = JSON.parse(stored);
        setNotes(parsedNotes);
        console.log("[NotesContext] Loaded", parsedNotes.length, "notes");
      }
    } catch (error) {
      console.error("[NotesContext] Load notes error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveNotesToStorage = useCallback(
    async (notesToSave: EncryptedNote[]) => {
      try {
        await AsyncStorage.setItem(
          NOTES_STORAGE_KEY,
          JSON.stringify(notesToSave),
        );
        console.log("[NotesContext] Notes saved to storage");
      } catch (error) {
        console.error("[NotesContext] Save notes error:", error);
      }
    },
    [],
  );

  const createNote = useCallback(
    async (title: string, content: string): Promise<Note> => {
      if (!isConnected) {
        throw new Error("Wallet not connected");
      }

      console.log("[NotesContext] Creating note...");
      setIsLoading(true);

      try {
        // Get signature from Mobile Wallet Adapter for encryption key
        const signature = await getEncryptionSignature();
        const encryptionKey =
          EncryptionService.generateEncryptionKey(signature);

        const noteData: StoredNoteData = {
          id: Date.now().toString(),
          title,
          content,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const encryptedContent = EncryptionService.encrypt(
          JSON.stringify(noteData),
          encryptionKey,
        );

        let cid = "";
        if (ipfsToken) {
          try {
            cid = await IPFSService.uploadEncryptedData(
              encryptedContent,
              ipfsToken,
            );
            console.log("[NotesContext] Note uploaded to IPFS with CID:", cid);
          } catch (error) {
            console.warn(
              "[NotesContext] IPFS upload failed, storing locally only:",
              error,
            );
          }
        } else {
          console.log("[NotesContext] No IPFS token, storing locally only");
        }

        const encryptedNote: EncryptedNote = {
          id: noteData.id,
          title,
          cid: cid || encryptedContent,
          createdAt: noteData.createdAt,
          updatedAt: noteData.updatedAt,
        };

        const updatedNotes = [...notes, encryptedNote];
        setNotes(updatedNotes);
        await saveNotesToStorage(updatedNotes);

        console.log("[NotesContext] Note created successfully");
        return noteData;
      } catch (error) {
        console.error("[NotesContext] Create note error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, ipfsToken, notes, saveNotesToStorage, getEncryptionSignature],
  );

  const getNote = useCallback(
    async (noteId: string): Promise<Note | null> => {
      if (!isConnected) {
        throw new Error("Wallet not connected");
      }

      console.log("[NotesContext] Getting note:", noteId);
      setIsLoading(true);

      try {
        const encryptedNote = notes.find((n) => n.id === noteId);
        if (!encryptedNote) {
          throw new Error("Note not found");
        }

        // Get signature from Mobile Wallet Adapter for decryption key
        const signature = await getEncryptionSignature();
        const encryptionKey =
          EncryptionService.generateEncryptionKey(signature);

        let encryptedContent = encryptedNote.cid;

        if (
          encryptedNote.cid.startsWith("bafy") ||
          encryptedNote.cid.startsWith("Qm")
        ) {
          try {
            encryptedContent = await IPFSService.downloadEncryptedData(
              encryptedNote.cid,
            );
            console.log("[NotesContext] Downloaded from IPFS");
          } catch (error) {
            console.warn(
              "[NotesContext] IPFS download failed, using local data:",
              error,
            );
          }
        }

        const decryptedContent = EncryptionService.decrypt(
          encryptedContent,
          encryptionKey,
        );
        const noteData: StoredNoteData = JSON.parse(decryptedContent);

        console.log("[NotesContext] Note decrypted successfully");
        return noteData;
      } catch (error) {
        console.error("[NotesContext] Get note error:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, notes, getEncryptionSignature],
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      console.log("[NotesContext] Deleting note:", noteId);

      try {
        const updatedNotes = notes.filter((n) => n.id !== noteId);
        setNotes(updatedNotes);
        await saveNotesToStorage(updatedNotes);
        console.log("[NotesContext] Note deleted successfully");
      } catch (error) {
        console.error("[NotesContext] Delete note error:", error);
        throw error;
      }
    },
    [notes, saveNotesToStorage],
  );

  const loadIPFSToken = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem(IPFS_TOKEN_KEY);
      if (token) {
        setIpfsToken(token);
      }
    } catch (error) {
      console.error("[NotesContext] Load IPFS token error:", error);
    }
  }, []);

  const saveIPFSToken = useCallback(async (token: string) => {
    try {
      await AsyncStorage.setItem(IPFS_TOKEN_KEY, token);
      setIpfsToken(token);
      console.log("[NotesContext] IPFS token saved");
    } catch (error) {
      console.error("[NotesContext] Save IPFS token error:", error);
    }
  }, []);

  return {
    notes,
    isLoading,
    ipfsToken,
    loadNotes,
    createNote,
    getNote,
    deleteNote,
    loadIPFSToken,
    saveIPFSToken,
  };
});
