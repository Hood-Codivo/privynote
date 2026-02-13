import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const BIOMETRIC_ENABLED_KEY = "biometric_auth_enabled";
const APP_LOCKED_KEY = "app_locked";

export class BiometricService {
  /**
   * Check if device supports biometric authentication
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error("[Biometric] Error checking availability:", error);
      return false;
    }
  }

  /**
   * Get supported biometric types
   */
  static async getSupportedTypes(): Promise<string[]> {
    try {
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      const typeNames: string[] = [];

      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        typeNames.push("Fingerprint");
      }
      if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
      ) {
        typeNames.push("Face ID");
      }
      if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        typeNames.push("Iris");
      }

      return typeNames;
    } catch (error) {
      console.error("[Biometric] Error getting supported types:", error);
      return [];
    }
  }

  /**
   * Authenticate with biometrics
   */
  static async authenticate(promptMessage?: string): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage:
          promptMessage || "Authenticate to access your secure notes",
        fallbackLabel: "Use passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error("[Biometric] Authentication error:", error);
      return false;
    }
  }

  /**
   * Check if biometric authentication is enabled for the app
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      return enabled === "true";
    } catch (error) {
      console.error("[Biometric] Error checking if enabled:", error);
      return false;
    }
  }

  /**
   * Enable biometric authentication
   */
  static async enableBiometric(): Promise<void> {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
      console.log("[Biometric] Biometric authentication enabled");
    } catch (error) {
      console.error("[Biometric] Error enabling biometric:", error);
      throw error;
    }
  }

  /**
   * Disable biometric authentication
   */
  static async disableBiometric(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      console.log("[Biometric] Biometric authentication disabled");
    } catch (error) {
      console.error("[Biometric] Error disabling biometric:", error);
      throw error;
    }
  }

  /**
   * Check if app is currently locked
   */
  static async isAppLocked(): Promise<boolean> {
    try {
      const locked = await SecureStore.getItemAsync(APP_LOCKED_KEY);
      return locked === "true";
    } catch (error) {
      console.error("[Biometric] Error checking lock status:", error);
      return false;
    }
  }

  /**
   * Lock the app (requires biometric to unlock)
   */
  static async lockApp(): Promise<void> {
    try {
      await SecureStore.setItemAsync(APP_LOCKED_KEY, "true");
      console.log("[Biometric] App locked");
    } catch (error) {
      console.error("[Biometric] Error locking app:", error);
      throw error;
    }
  }

  /**
   * Unlock the app
   */
  static async unlockApp(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(APP_LOCKED_KEY);
      console.log("[Biometric] App unlocked");
    } catch (error) {
      console.error("[Biometric] Error unlocking app:", error);
      throw error;
    }
  }

  /**
   * Authenticate and unlock app if biometric is enabled
   */
  static async authenticateAndUnlock(): Promise<boolean> {
    try {
      const isBiometricEnabled = await this.isBiometricEnabled();
      const isLocked = await this.isAppLocked();

      if (!isBiometricEnabled || !isLocked) {
        return true; // No authentication needed
      }

      const authenticated = await this.authenticate("Unlock your secure notes");

      if (authenticated) {
        await this.unlockApp();
        return true;
      }

      return false;
    } catch (error) {
      console.error("[Biometric] Error during authenticate and unlock:", error);
      return false;
    }
  }

  /**
   * Get a user-friendly description of available biometric methods
   */
  static async getBiometricDescription(): Promise<string> {
    const types = await this.getSupportedTypes();

    if (types.length === 0) {
      return "No biometric authentication available";
    }

    if (types.includes("Face ID")) {
      return "Face ID";
    }

    if (types.includes("Fingerprint")) {
      return "Fingerprint";
    }

    return types[0];
  }
}
