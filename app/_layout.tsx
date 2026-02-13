import { NotesProvider } from "@/contexts/NotesContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { clusterApiUrl } from "@solana/web3.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MobileWalletProvider } from "@wallet-ui/react-native-web3js";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Mobile Wallet Adapter Configuration
const chain = "solana:devnet"; // or 'solana:mainnet-beta' for production
const endpoint = clusterApiUrl("devnet"); // or clusterApiUrl('mainnet-beta')

const APP_IDENTITY = {
  name: "Solana Secure Notes",
  uri: "https://solana-secure-notes.rork.app",
  icon: "favicon.png", // Must be relative to the uri above
};

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="notes/index" options={{ headerShown: false }} />
      <Stack.Screen name="notes/create" options={{ headerShown: false }} />
      <Stack.Screen name="notes/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MobileWalletProvider
          chain={chain}
          endpoint={endpoint}
          identity={APP_IDENTITY}
        >
          <WalletProvider>
            <NotesProvider>
              <RootLayoutNav />
            </NotesProvider>
          </WalletProvider>
        </MobileWalletProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
