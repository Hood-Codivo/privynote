import { useNotes } from '@/contexts/NotesContext';
import { useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateNoteScreen() {
  const router = useRouter();
  const { createNote } = useNotes();
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a title for your note');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Content Required', 'Please enter some content for your note');
      return;
    }

    setIsSaving(true);
    try {
      await createNote(title.trim(), content.trim());
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
            disabled={isSaving}
          >
            <X size={24} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>New Note</Text>
          
          <TouchableOpacity
            style={[styles.headerButton, styles.saveButton]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Check size={24} color="#000" strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              style={styles.titleInput}
              placeholder="Note Title"
              placeholderTextColor="#4B5563"
              value={title}
              onChangeText={setTitle}
              editable={!isSaving}
              autoFocus
            />

            <TextInput
              style={styles.contentInput}
              placeholder="Write your encrypted note here..."
              placeholderTextColor="#4B5563"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              editable={!isSaving}
            />

            <View style={styles.encryptionNotice}>
              <Text style={styles.encryptionText}>
                🔒 This note will be encrypted with your Solana wallet signature before storage
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 20,
    paddingVertical: 12,
  },
  contentInput: {
    fontSize: 16,
    color: '#E5E7EB',
    lineHeight: 24,
    minHeight: 300,
  },
  encryptionNotice: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#10B98110',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  encryptionText: {
    fontSize: 13,
    color: '#10B981',
    lineHeight: 20,
    textAlign: 'center',
  },
});