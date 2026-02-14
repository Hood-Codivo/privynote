import { useNotes } from "@/contexts/NotesContext";
import { Note } from "@/types/note";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Edit3, Lock, Trash2, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ViewNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getNote, deleteNote } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadNote = useCallback(async () => {
    if (!id || typeof id !== "string") return;

    setIsLoading(true);
    try {
      const loadedNote = await getNote(id);
      setNote(loadedNote);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load note");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id, getNote, router]);

  useEffect(() => {
    loadNote();
  }, []);

  const handleDelete = () => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!id || typeof id !== "string") return;

            setIsDeleting(true);
            try {
              await deleteNote(id);
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete note");
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    router.push(`/notes/edit/${id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Decrypting note...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            disabled={isDeleting}
          >
            <X size={24} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Lock size={16} color="#10B981" strokeWidth={2} />
            <Text style={styles.headerTitle}>Encrypted</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleEdit}
              disabled={isDeleting}
            >
              <Edit3 size={20} color="#10B981" strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerButton, styles.deleteButton]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Trash2 size={20} color="#EF4444" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{note.title}</Text>

          <Text style={styles.date}>
            {new Date(note.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.content}>{note.content}</Text>

          {note.cid &&
            (note.cid.startsWith("bafy") || note.cid.startsWith("Qm")) && (
              <View style={styles.ipfsNotice}>
                <Text style={styles.ipfsLabel}>Stored on IPFS</Text>
                <Text style={styles.ipfsCID} numberOfLines={1}>
                  {note.cid}
                </Text>
              </View>
            )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#10B981",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  deleteButton: {
    backgroundColor: "#EF444410",
    borderColor: "#EF444430",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  date: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginBottom: 24,
  },
  content: {
    fontSize: 16,
    color: "#E5E7EB",
    lineHeight: 26,
  },
  ipfsNotice: {
    marginTop: 32,
    padding: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  ipfsLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#10B981",
    marginBottom: 6,
  },
  ipfsCID: {
    fontSize: 11,
    color: "#6B7280",
    fontFamily: Platform.select({ ios: "Courier", android: "monospace" }),
  },
});
