import { useWallet } from "@/contexts/WalletContext";
import { useRouter } from "expo-router";
import { Key, Lock, Shield } from "lucide-react-native";
import { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// index.js

export default function WalletConnectScreen() {
  const router = useRouter();
  const { isConnected, isConnecting, connect } = useWallet();

  useEffect(() => {
    if (isConnected) {
      router.replace("/notes");
    }
  }, [isConnected, router]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Shield size={64} color="#10B981" strokeWidth={1.5} />
            </View>

            <Text style={styles.title}>Solana Secure Notes</Text>
            <Text style={styles.subtitle}>
              Encrypted notes stored on decentralized infrastructure
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Lock size={24} color="#10B981" strokeWidth={2} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>End-to-End Encrypted</Text>
                <Text style={styles.featureDescription}>
                  Your notes are encrypted locally before leaving your device
                </Text>
              </View>
            </View>

            <View style={styles.feature}>
              <Key size={24} color="#10B981" strokeWidth={2} />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Your Keys, Your Data</Text>
                <Text style={styles.featureDescription}>
                  Only your Solana wallet can decrypt your notes
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bottom}>
            <TouchableOpacity
              style={[
                styles.connectButton,
                isConnecting && styles.connectButtonDisabled,
              ]}
              onPress={handleConnect}
              disabled={isConnecting}
              activeOpacity={0.8}
            >
              {isConnecting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.connectButtonText}>Connect Wallet</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              A Solana wallet will be created and secured on your device
            </Text>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 80,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#10B98115",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  features: {
    gap: 24,
  },
  feature: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 20,
  },
  bottom: {
    marginBottom: 40,
    gap: 16,
  },
  connectButton: {
    backgroundColor: "#10B981",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  connectButtonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#000000",
  },
  disclaimer: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
});
