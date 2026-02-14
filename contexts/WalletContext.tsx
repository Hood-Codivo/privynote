import { BiometricService } from "@/services/biometricService";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMobileWallet } from "@wallet-ui/react-native-web3js";
import bs58 from "bs58";
import { useCallback, useEffect, useState } from "react";

const AUTH_TOKEN_KEY = "mwa_auth_token";
const CACHED_ADDRESS_KEY = "mwa_cached_address";
const CACHED_SIGNATURE_KEY = "mwa_cached_signature";

export const [WalletProvider, useWallet] = createContextHook(() => {
  const mobileWallet = useMobileWallet();
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [cachedAuthToken, setCachedAuthToken] = useState<string | null>(null);
  const [cachedAddress, setCachedAddress] = useState<string | null>(null);
  const [cachedSignature, setCachedSignature] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const available = await BiometricService.isAvailable();
      setBiometricAvailable(available);

      const enabled = await BiometricService.isBiometricEnabled();
      setBiometricEnabled(enabled);

      const locked = await BiometricService.isAppLocked();
      setIsLocked(locked);

      const [token, address, signature] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(CACHED_ADDRESS_KEY),
        AsyncStorage.getItem(CACHED_SIGNATURE_KEY),
      ]);

      if (token && address) {
        setCachedAuthToken(token);
        setCachedAddress(address);
        setCachedSignature(signature);
        console.log("[WalletContext] Cached authorization found");
      }

      if (locked && enabled) {
        console.log(
          "[WalletContext] App is locked, biometric authentication required",
        );
        return;
      }

      if (token && address && !locked) {
        console.log("[WalletContext] Auto-reconnecting with cached auth...");
      }
    } catch (error) {
      console.error("[WalletContext] Initialization error:", error);
    }
  };

  const unlock = useCallback(async (): Promise<boolean> => {
    console.log("[WalletContext] Unlocking app...");

    try {
      const success = await BiometricService.authenticateAndUnlock();

      if (success) {
        setIsLocked(false);
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

  const connect = useCallback(async () => {
    console.log("[WalletContext] Connecting wallet...");

    try {
      await mobileWallet.connect();

      if (mobileWallet.account) {
        const address = mobileWallet.account.address.toString();
        await AsyncStorage.setItem(CACHED_ADDRESS_KEY, address);
        setCachedAddress(address);

        console.log("[WalletContext] Getting encryption signature...");
        const messageBytes = new TextEncoder().encode("secure-notes-key");
        const signature = await mobileWallet.signMessage(messageBytes);
        const signatureBase58 = bs58.encode(signature);

        await AsyncStorage.setItem(CACHED_SIGNATURE_KEY, signatureBase58);
        setCachedSignature(signatureBase58);

        console.log(
          "[WalletContext] Wallet connected and signature cached:",
          address,
        );
      }
    } catch (error) {
      console.error("[WalletContext] Connection error:", error);
      throw error;
    }
  }, [mobileWallet]);

  /**
   * Disconnect wallet - CRITICAL: Clear ALL cached data
   */
  const disconnect = useCallback(async () => {
    console.log("[WalletContext] Disconnecting wallet and clearing cache...");

    try {
      // Disconnect MWA session
      await mobileWallet.disconnect();

      // SECURITY FIX: Clear ALL cached data including signature
      await AsyncStorage.multiRemove([
        AUTH_TOKEN_KEY,
        CACHED_ADDRESS_KEY,
        CACHED_SIGNATURE_KEY,
      ]);
      setCachedAuthToken(null);
      setCachedAddress(null);
      setCachedSignature(null);

      console.log("[WalletContext] Wallet disconnected and all cache cleared");
    } catch (error) {
      console.error("[WalletContext] Disconnect error:", error);
      throw error;
    }
  }, [mobileWallet]);

  /**
   * Lock wallet - keeps cache for SAME wallet reconnection
   */
  const lock = useCallback(async () => {
    console.log("[WalletContext] Locking wallet...");

    try {
      if (biometricEnabled) {
        await BiometricService.lockApp();
        setIsLocked(true);
      }

      // Just disconnect session, keep cache for unlock
      await mobileWallet.disconnect();

      console.log("[WalletContext] Wallet locked (cache preserved for unlock)");
    } catch (error) {
      console.error("[WalletContext] Lock error:", error);
      throw error;
    }
  }, [biometricEnabled, mobileWallet]);

  const deleteWallet = useCallback(async () => {
    console.log("[WalletContext] Permanently deleting wallet data...");

    try {
      await mobileWallet.disconnect();

      await AsyncStorage.multiRemove([
        AUTH_TOKEN_KEY,
        CACHED_ADDRESS_KEY,
        CACHED_SIGNATURE_KEY,
      ]);
      setCachedAuthToken(null);
      setCachedAddress(null);
      setCachedSignature(null);

      setIsLocked(false);
      console.log("[WalletContext] Wallet data deleted permanently");
    } catch (error) {
      console.error("[WalletContext] Delete wallet error:", error);
      throw error;
    }
  }, [mobileWallet]);

  const enableBiometric = useCallback(async () => {
    try {
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

  const getEncryptionSignature = useCallback(async (): Promise<string> => {
    if (cachedSignature) {
      console.log("[WalletContext] Using cached encryption signature");
      return cachedSignature;
    }

    if (mobileWallet.account) {
      console.log(
        "[WalletContext] No cached signature, requesting from wallet...",
      );
      const messageBytes = new TextEncoder().encode("secure-notes-key");
      const signature = await mobileWallet.signMessage(messageBytes);
      const signatureBase58 = bs58.encode(signature);

      await AsyncStorage.setItem(CACHED_SIGNATURE_KEY, signatureBase58);
      setCachedSignature(signatureBase58);

      return signatureBase58;
    }

    throw new Error("Wallet not connected and no cached signature");
  }, [cachedSignature, mobileWallet]);

  const clearCachedSignature = useCallback(async () => {
    await AsyncStorage.removeItem(CACHED_SIGNATURE_KEY);
    setCachedSignature(null);
    console.log("[WalletContext] Cached signature cleared");
  }, []);

  return {
    account: mobileWallet.account,
    publicKey: mobileWallet.account?.publicKey || null,
    isConnected: !!mobileWallet.account,
    isConnecting: false,
    isLocked,
    biometricEnabled,
    biometricAvailable,
    cachedAuthToken,
    cachedAddress,
    cachedSignature,
    connect,
    disconnect, // NOW CLEARS ALL CACHE
    lock,
    unlock,
    deleteWallet,
    enableBiometric,
    disableBiometric,
    signMessage,
    getEncryptionSignature,
    clearCachedSignature,
    mobileWallet,
  };
});
