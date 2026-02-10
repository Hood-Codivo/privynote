import CryptoJS from 'crypto-js';

export class EncryptionService {
  static deriveKeyFromSignature(signature: string): string {
    return CryptoJS.SHA256(signature).toString();
  }

  static encrypt(plaintext: string, key: string): string {
    console.log('[Encryption] Encrypting data...');
    const encrypted = CryptoJS.AES.encrypt(plaintext, key).toString();
    console.log('[Encryption] Data encrypted successfully');
    return encrypted;
  }

  static decrypt(ciphertext: string, key: string): string {
    console.log('[Encryption] Decrypting data...');
    try {
      const decrypted = CryptoJS.AES.decrypt(ciphertext, key);
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!plaintext) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }
      
      console.log('[Encryption] Data decrypted successfully');
      return plaintext;
    } catch (error) {
      console.error('[Encryption] Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static generateEncryptionKey(message: string, signature: string): string {
    console.log('[Encryption] Generating encryption key from signature');
    return this.deriveKeyFromSignature(signature);
  }
}
