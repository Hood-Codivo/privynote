import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import bs58 from 'bs58';
import * as SecureStore from 'expo-secure-store';
import nacl from 'tweetnacl';

const WALLET_KEY = 'solana_wallet_private_key';
const SIGNING_MESSAGE = 'secure-notes-key';

export class SolanaService {
  private static connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  static async createOrLoadWallet(): Promise<Keypair> {
    console.log('[Solana] Creating or loading wallet...');
    
    try {
      const storedKey = await SecureStore.getItemAsync(WALLET_KEY);
      
      if (storedKey) {
        console.log('[Solana] Loading existing wallet');
        const secretKey = bs58.decode(storedKey);
        return Keypair.fromSecretKey(secretKey);
      }
      
      console.log('[Solana] Creating new wallet');
      const newKeypair = Keypair.generate();
      const encoded = bs58.encode(newKeypair.secretKey);
      await SecureStore.setItemAsync(WALLET_KEY, encoded);
      
      console.log('[Solana] New wallet created:', newKeypair.publicKey.toBase58());
      return newKeypair;
    } catch (error) {
      console.error('[Solana] Wallet creation/loading error:', error);
      throw new Error('Failed to create or load wallet');
    }
  }

  static async getPublicKey(): Promise<PublicKey | null> {
    try {
      const keypair = await this.createOrLoadWallet();
      return keypair.publicKey;
    } catch (error) {
      console.error('[Solana] Error getting public key:', error);
      return null;
    }
  }

  static async signMessage(message: string): Promise<string> {
    console.log('[Solana] Signing message:', message);
    
    try {
      const keypair = await this.createOrLoadWallet();
      const messageBytes = new TextEncoder().encode(message);
      const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
      const signatureBase58 = bs58.encode(signature);
      
      console.log('[Solana] Message signed successfully');
      return signatureBase58;
    } catch (error) {
      console.error('[Solana] Signing error:', error);
      throw new Error('Failed to sign message');
    }
  }

  static async getEncryptionSignature(): Promise<string> {
    return this.signMessage(SIGNING_MESSAGE);
  }

  static async disconnectWallet(): Promise<void> {
    console.log('[Solana] Disconnecting wallet...');
    await SecureStore.deleteItemAsync(WALLET_KEY);
    console.log('[Solana] Wallet disconnected');
  }

  static getConnection(): Connection {
    return this.connection;
  }
}