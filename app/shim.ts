// Import the crypto getRandomValues shim
import "react-native-get-random-values";

// Import the crypto.getRandomValues polyfill
import { getRandomValues } from "react-native-get-random-values";

// Extend the global crypto type
declare global {
  interface Crypto {
    getRandomValues: <T extends ArrayBufferView>(array: T) => T;
  }
  var crypto: Crypto;
}

// Initialize crypto if it doesn't exist
if (!global.crypto) {
  // @ts-ignore - We're adding the crypto object to global
  global.crypto = {
    getRandomValues: getRandomValues as <T extends ArrayBufferView>(
      array: T,
    ) => T,
  };
} else if (typeof global.crypto.getRandomValues !== "function") {
  // @ts-ignore - We're ensuring the method exists with the correct type
  global.crypto.getRandomValues = getRandomValues as <
    T extends ArrayBufferView,
  >(
    array: T,
  ) => T;
}

export {};
