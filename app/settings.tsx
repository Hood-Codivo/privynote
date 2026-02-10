import { useNotes } from '@/contexts/NotesContext';
import { useRouter } from 'expo-router';
import { Key, Save, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { ipfsToken, saveIPFSToken } = useNotes();
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    setToken(ipfsToken);
  }, [ipfsToken]);

  const handleSave = async () => {
    try {
      await saveIPFSToken(token);
      Alert.alert('Success', 'IPFS token saved successfully');
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save IPFS token');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <X size={24} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Settings</Text>
          
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Key size={20} color="#10B981" strokeWidth={2} />
              <Text style={styles.sectionTitle}>IPFS Configuration</Text>
            </View>

            <Text style={styles.description}>
              Add your Web3.Storage API token to enable decentralized storage. Without it, notes will be stored locally only.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your Web3.Storage API token"
              placeholderTextColor="#4B5563"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Save size={20} color="#000" strokeWidth={2} />
              <Text style={styles.saveButtonText}>Save Configuration</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>How to get an API token:</Text>
              <Text style={styles.infoText}>
                1. Visit web3.storage{'\n'}
                2. Sign up or log in{'\n'}
                3. Create a new API token{'\n'}
                4. Copy and paste it here
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>
              Solana Secure Notes uses end-to-end encryption to protect your data. Your notes are encrypted locally before being stored, and only your Solana wallet can decrypt them.
            </Text>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000000',
  },
  infoBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});
