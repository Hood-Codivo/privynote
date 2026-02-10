import { Link, Stack } from "expo-router";
import { AlertCircle } from 'lucide-react-native';
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <AlertCircle size={64} color="#6B7280" strokeWidth={1.5} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.description}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: '#0A0A0A',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: '#FFFFFF',
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  link: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#10B981',
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: "#000000",
  },
});
