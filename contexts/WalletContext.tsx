import { BiometricService } from "@/services/biometricService";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMobileWallet } from "@wallet-ui/react-native-web3js";
import { useCallback, useEffect, useState } from "react";

const AUTH_TOKEN_KEY = "mwa_auth_token";
const CACHED_ADDRESS_KEY = "mwa_cached_address";

export const [WalletProvider, useWallet] = createContextHook(() => {
  const mobileWallet = useMobileWallet();
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [cachedAuthToken, setCachedAuthToken] = useState<string | null>(null);
  const [cachedAddress, setCachedAddress] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      // Check if biometric is available
      const available = await BiometricService.isAvailable();
      setBiometricAvailable(available);

      // Check if biometric is enabled
      const enabled = await BiometricService.isBiometricEnabled();
      setBiometricEnabled(enabled);

      // Check if app is locked
      const locked = await BiometricService.isAppLocked();
      setIsLocked(locked);

      // Load cached auth token and address
      const [token, address] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(CACHED_ADDRESS_KEY),
      ]);

      if (token && address) {
        setCachedAuthToken(token);
        setCachedAddress(address);
        console.log("[WalletContext] Cached authorization found");
      }

      // If locked and biometric enabled, require authentication
      if (locked && enabled) {
        console.log(
          "[WalletContext] App is locked, biometric authentication required",
        );
        return;
      }

      // Auto-reconnect if we have cached credentials and not locked
      if (token && address && !locked) {
        console.log("[WalletContext] Auto-reconnecting with cached auth...");
        // The MobileWalletProvider will handle reconnection
      }
    } catch (error) {
      console.error("[WalletContext] Initialization error:", error);
    }
  };

  /**
   * Unlock app with biometric authentication
   */
  const unlock = useCallback(async (): Promise<boolean> => {
    console.log("[WalletContext] Unlocking app...");

    try {
      const success = await BiometricService.authenticateAndUnlock();

      if (success) {
        setIsLocked(false);
        // After unlock, reconnect if we have cached credentials
        if (cachedAuthToken && cachedAddress && !mobileWallet.account) {
          await mobileWallet.connect();
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error("[WalletContext] Unlock error:", error);
      return false;
    }
  }, [cachedAuthToken, cachedAddress, mobileWallet]);

  /**
   * Connect wallet - uses Mobile Wallet Adapter
   */
  const connect = useCallback(async () => {
    console.log("[WalletContext] Connecting wallet...");

    try {
      // Use the connect method from useMobileWallet
      await mobileWallet.connect();

      // Cache the authorization details
      // Note: The library manages the auth token internally, but we can cache the address
      if (mobileWallet.account) {
        const address = mobileWallet.account.address.toString();
        await AsyncStorage.setItem(CACHED_ADDRESS_KEY, address);
        setCachedAddress(address);
        console.log("[WalletContext] Wallet connected and cached:", address);
      }
    } catch (error) {
      console.error("[WalletContext] Connection error:", error);
      throw error;
    }
  }, [mobileWallet]);

  /**
   * Lock wallet (keeps in storage, just locks the app)
   */
  const lock = useCallback(async () => {
    console.log("[WalletContext] Locking wallet...");

    try {
      // If biometric is enabled, lock the app
      if (biometricEnabled) {
        await BiometricService.lockApp();
        setIsLocked(true);
      }

      // Disconnect from current session (but keep cached credentials)
      await mobileWallet.disconnect();

      console.log("[WalletContext] Wallet locked");
    } catch (error) {
      console.error("[WalletContext] Lock error:", error);
      throw error;
    }
  }, [biometricEnabled, mobileWallet]);

  /**
   * Permanently delete wallet/clear all cached data
   */
  const deleteWallet = useCallback(async () => {
    console.log("[WalletContext] Permanently deleting wallet data...");

    try {
      // Disconnect current session
      await mobileWallet.disconnect();

      // Clear all cached data
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, CACHED_ADDRESS_KEY]);
      setCachedAuthToken(null);
      setCachedAddress(null);

      setIsLocked(false);
      console.log("[WalletContext] Wallet data deleted permanently");
    } catch (error) {
      console.error("[WalletContext] Delete wallet error:", error);
      throw error;
    }
  }, [mobileWallet]);

  /**
   * Enable biometric authentication
   */
  const enableBiometric = useCallback(async () => {
    try {
      // First authenticate to enable
      const authenticated = await BiometricService.authenticate(
        "Authenticate to enable biometric unlock",
      );

      if (!authenticated) {
        throw new Error("Authentication failed");
      }

      await BiometricService.enableBiometric();
      setBiometricEnabled(true);
      console.log("[WalletContext] Biometric authentication enabled");
    } catch (error) {
      console.error("[WalletContext] Enable biometric error:", error);
      throw error;
    }
  }, []);

  /**
   * Disable biometric authentication
   */
  const disableBiometric = useCallback(async () => {
    try {
      await BiometricService.disableBiometric();
      setBiometricEnabled(false);
      console.log("[WalletContext] Biometric authentication disabled");
    } catch (error) {
      console.error("[WalletContext] Disable biometric error:", error);
      throw error;
    }
  }, []);

  /**
   * Sign a message using Mobile Wallet Adapter
   */
  const signMessage = useCallback(
    async (message: string): Promise<Uint8Array> => {
      if (!mobileWallet.account) {
        throw new Error("Wallet not connected");
      }

      const messageBytes = new TextEncoder().encode(message);
      const signature = await mobileWallet.signMessage(messageBytes);
      return signature;
    },
    [mobileWallet],
  );

  /**
   * Get encryption signature for note encryption
   */
  const getEncryptionSignature = useCallback(async (): Promise<string> => {
    const signature = await signMessage("secure-notes-key");
    // Convert Uint8Array to base58 string
    const bs58 = require("bs58");
    return bs58.encode(signature);
  }, [signMessage]);

  return {
    // Mobile Wallet Adapter account and connection status
    account: mobileWallet.account,
    publicKey: mobileWallet.account?.publicKey || null,
    isConnected: !!mobileWallet.account,
    isConnecting: false, // MWA handles this internally

    // Lock/unlock state
    isLocked,

    // Biometric state
    biometricEnabled,
    biometricAvailable,

    // Cached credentials
    cachedAuthToken,
    cachedAddress,

    // Actions
    connect,
    disconnect: mobileWallet.disconnect,
    lock,
    unlock,
    deleteWallet,
    enableBiometric,
    disableBiometric,
    signMessage,
    getEncryptionSignature,

    // Expose the full MWA instance for advanced usage
    mobileWallet,
  };
});
