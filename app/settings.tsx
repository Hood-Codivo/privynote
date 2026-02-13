import { useNotes } from "@/contexts/NotesContext";
import { useWallet } from "@/contexts/WalletContext";
import { useRouter } from "expo-router";
import { Fingerprint, Key, Save, Trash2, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const { ipfsToken, saveIPFSToken } = useNotes();
  const {
    biometricEnabled,
    biometricAvailable,
    enableBiometric,
    disableBiometric,
    deleteWallet,
    account,
  } = useWallet();

  const [token, setToken] = useState<string>("");
  const [isBiometricOn, setIsBiometricOn] = useState(false);

  useEffect(() => {
    setToken(ipfsToken);
    setIsBiometricOn(biometricEnabled);
  }, [ipfsToken, biometricEnabled]);

  const handleSaveIPFS = async () => {
    try {
      await saveIPFSToken(token);
      Alert.alert("Success", "IPFS token saved successfully");
    } catch {
      Alert.alert("Error", "Failed to save IPFS token");
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    try {
      if (value) {
        await enableBiometric();
        setIsBiometricOn(true);
        Alert.alert("Success", "Biometric authentication enabled");
      } else {
        await disableBiometric();
        setIsBiometricOn(false);
        Alert.alert("Success", "Biometric authentication disabled");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update biometric settings");
      setIsBiometricOn(biometricEnabled);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Wallet Cache",
      "WARNING: This will permanently clear all cached wallet data and you will need to reconnect your wallet. Your notes will remain safe. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Cache",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWallet();
              Alert.alert(
                "Cache Cleared",
                "Wallet cache cleared. You will need to reconnect on next launch.",
                [
                  {
                    text: "OK",
                    onPress: () => router.replace("/"),
                  },
                ],
              );
            } catch (error) {
              Alert.alert("Error", "Failed to clear cache");
            }
          },
        },
      ],
    );
  };

  const getBiometricDescription = () => {
    if (!biometricAvailable) {
      return "Biometric authentication is not available on this device";
    }
    return "Lock app and require biometric authentication to unlock";
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
          {/* Connected Wallet Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Key size={20} color="#10B981" strokeWidth={2} />
              <Text style={styles.sectionTitle}>Connected Wallet</Text>
            </View>

            <View style={styles.walletCard}>
              <Text style={styles.walletLabel}>Address</Text>
              <Text style={styles.walletAddress}>
                {account?.address.toString()}
              </Text>
              <Text style={styles.walletType}>Mobile Wallet Adapter</Text>
            </View>
          </View>

          {/* Biometric Authentication */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Fingerprint size={20} color="#10B981" strokeWidth={2} />
              <Text style={styles.sectionTitle}>Biometric Authentication</Text>
            </View>

            <Text style={styles.description}>{getBiometricDescription()}</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Biometric Lock</Text>
              <Switch
                value={isBiometricOn}
                onValueChange={handleToggleBiometric}
                disabled={!biometricAvailable}
                trackColor={{ false: "#2A2A2A", true: "#10B98150" }}
                thumbColor={isBiometricOn ? "#10B981" : "#6B7280"}
              />
            </View>

            {biometricEnabled && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  ℹ️ When you lock the app, biometric authentication will be
                  required to unlock it
                </Text>
              </View>
            )}
          </View>

          {/* Wallet Management */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Key size={20} color="#10B981" strokeWidth={2} />
              <Text style={styles.sectionTitle}>Wallet Management</Text>
            </View>

            <Text style={styles.description}>
              Your wallet is connected via Mobile Wallet Adapter. The wallet app
              (Phantom, Solflare, etc.) manages your private keys securely.
            </Text>

            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearCache}
              activeOpacity={0.8}
            >
              <Trash2 size={20} color="#EF4444" strokeWidth={2} />
              <Text style={styles.dangerButtonText}>Clear Wallet Cache</Text>
            </TouchableOpacity>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Clearing the cache will disconnect your wallet. You can
                reconnect anytime with the same wallet. Your encrypted notes
                remain safe.
              </Text>
            </View>
          </View>

          {/* IPFS Configuration */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Key size={20} color="#10B981" strokeWidth={2} />
              <Text style={styles.sectionTitle}>IPFS Configuration</Text>
            </View>

            <Text style={styles.description}>
              Add your Web3.Storage API token to enable decentralized storage.
              Without it, notes will be stored locally only.
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
              onPress={handleSaveIPFS}
              activeOpacity={0.8}
            >
              <Save size={20} color="#000" strokeWidth={2} />
              <Text style={styles.saveButtonText}>Save Configuration</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>How to get an API token:</Text>
              <Text style={styles.infoText}>
                1. Visit web3.storage{"\n"}
                2. Sign up or log in{"\n"}
                3. Create a new API token{"\n"}
                4. Copy and paste it here
              </Text>
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>
              Solana Secure Notes uses end-to-end encryption to protect your
              data. Your notes are encrypted locally with your wallet signature
              before being stored, and only your Solana wallet can decrypt them.
            </Text>
            <Text style={styles.description}>
              Built with Mobile Wallet Adapter for secure, standardized wallet
              integration.
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  description: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
    marginBottom: 16,
  },
  walletCard: {
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  walletLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  walletAddress: {
    fontSize: 13,
    color: "#FFFFFF",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  walletType: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "600" as const,
    textTransform: "uppercase",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  settingLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500" as const,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EF444410",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EF444450",
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#EF4444",
  },
  warningBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F59E0B10",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F59E0B30",
  },
  warningText: {
    fontSize: 13,
    color: "#F59E0B",
    lineHeight: 18,
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 16,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#000000",
  },
  infoBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 20,
  },
});
