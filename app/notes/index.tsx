import { useNotes } from "@/contexts/NotesContext";
import { useWallet } from "@/contexts/WalletContext";
import { EncryptedNote } from "@/types/note";
import { useRouter } from "expo-router";
import { FileText, Lock, Plus, Settings } from "lucide-react-native";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotesListScreen() {
  const router = useRouter();
  const { isConnected, account, lock } = useWallet();
  const { notes, isLoading, loadNotes, loadIPFSToken } = useNotes();

  useEffect(() => {
    if (!isConnected) {
      router.replace("/");
      return;
    }
    loadNotes();
    loadIPFSToken();
  }, [isConnected, router, loadNotes, loadIPFSToken]);

  const handleLock = () => {
    Alert.alert("Lock App", "Lock the app to protect your notes?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Lock",
        style: "default",
        onPress: async () => {
          await lock();

          router.replace("/");
        },
      },
    ]);
  };

  const renderNote = ({ item }: { item: EncryptedNote }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => router.push(`/notes/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.noteIcon}>
        <FileText size={20} color="#10B981" strokeWidth={2} />
      </View>
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.noteDate}>
          {new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FileText size={64} color="#374151" strokeWidth={1.5} />
      <Text style={styles.emptyTitle}>No notes yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first encrypted note to get started
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Secure Notes</Text>
            <View style={styles.walletInfo}>
              <Text style={styles.walletType}>Mobile Wallet</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {account?.address.toString().slice(0, 8)}...
                {account?.address.toString().slice(-6)}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("/settings")}
            >
              <Settings size={24} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.lockButton]}
              onPress={handleLock}
            >
              <Lock size={24} color="#10B981" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : (
          <FlatList
            data={notes}
            renderItem={renderNote}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/notes/create")}
          activeOpacity={0.8}
        >
          <Plus size={28} color="#000" strokeWidth={2.5} />
        </TouchableOpacity>
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
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  walletInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  walletType: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600" as const,
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
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
  lockButton: {
    backgroundColor: "#10B98115",
    borderColor: "#10B98130",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    flexGrow: 1,
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  noteIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#10B98115",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  noteDate: {
    fontSize: 13,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
