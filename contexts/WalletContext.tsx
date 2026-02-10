import { SolanaService } from '@/services/solanaService';
import createContextHook from '@nkzw/create-context-hook';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

export const [WalletProvider, useWallet] = createContextHook(() => {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const key = await SolanaService.getPublicKey();
      if (key) {
        setPublicKey(key);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('[WalletContext] Check connection error:', error);
    }
  };

  const connect = async () => {
    console.log('[WalletContext] Connecting wallet...');
    setIsConnecting(true);
    
    try {
      const keypair = await SolanaService.createOrLoadWallet();
      setPublicKey(keypair.publicKey);
      setIsConnected(true);
      console.log('[WalletContext] Wallet connected:', keypair.publicKey.toBase58());
    } catch (error) {
      console.error('[WalletContext] Connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    console.log('[WalletContext] Disconnecting wallet...');
    
    try {
      await SolanaService.disconnectWallet();
      setPublicKey(null);
      setIsConnected(false);
      console.log('[WalletContext] Wallet disconnected');
    } catch (error) {
      console.error('[WalletContext] Disconnect error:', error);
      throw error;
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    return SolanaService.signMessage(message);
  };

  return {
    publicKey,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    signMessage,
  };
});
