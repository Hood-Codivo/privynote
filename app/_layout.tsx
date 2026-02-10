// Import the crypto polyfill first
import "./shim";

import { NotesProvider } from "@/contexts/NotesContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
        <WalletProvider>
          <NotesProvider>
            <RootLayoutNav />
          </NotesProvider>
        </WalletProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
