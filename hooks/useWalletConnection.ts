"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  WalletType, 
  NetworkType, 
  WalletConnectionState, 
  WalletSession, 
  WalletError,
  WalletConnectionStatus,
  SESSION_CONFIG,
  getWalletConfig,
  getNetworkConfig,
  isWalletSupported,
  isNetworkSupported,
  validateStellarAddress,
  getWalletError,
  formatWalletAddress,
  WALLET_ERRORS
} from '@/lib/wallets';

import { isConnected, getAddress, getNetwork as getFreighterNetwork } from "@stellar/freighter-api";
import albedo from "@albedo-link/intent";

// Wallet Provider interface
interface WalletProvider {
  isConnected(): Promise<boolean>;
  connect(): Promise<{ address: string; publicKey: string; network: NetworkType }>;
  disconnect(): Promise<void>;
  getNetwork(): Promise<NetworkType>;
}

// Real wallet implementations
const walletProviders: Record<WalletType, WalletProvider> = {
  freighter: {
    isConnected: async () => {
      const res = await isConnected();
      return typeof res === 'boolean' ? res : !!res?.isConnected;
    },
    connect: async () => {
      const addressRes = await getAddress();
      const address = typeof addressRes === 'string' ? addressRes : addressRes.address;
      
      const networkRes = await getFreighterNetwork();
      const networkStr = typeof networkRes === 'string' ? networkRes : networkRes?.network;
      
      return {
        address,
        publicKey: address,
        network: (networkStr?.toLowerCase() as NetworkType) || 'mainnet'
      };
    },
    disconnect: async () => {
      // Freighter doesn't have a programmatic disconnect
    },
    getNetwork: async () => {
      const networkRes = await getFreighterNetwork();
      const networkStr = typeof networkRes === 'string' ? networkRes : networkRes?.network;
      return (networkStr?.toLowerCase() as NetworkType) || 'mainnet';
    },
  },
  albedo: {
    isConnected: async () => true, // Albedo is web-based, always "available"
    connect: async () => {
      const res = await albedo.publicKey({
        token: 'trustquest-auth' // Optional token for Albedo
      });
      return {
        address: res.pubkey,
        publicKey: res.pubkey,
        network: 'mainnet' // Albedo usually defaults to mainnet or user selection
      };
    },
    disconnect: async () => {},
    getNetwork: async () => 'mainnet',
  },
  xbull: {
    isConnected: async () => !!(window as any).xBullWallet,
    connect: async () => {
      const res = await (window as any).xBullWallet.getPublicKey();
      return {
        address: res,
        publicKey: res,
        network: 'mainnet'
      };
    },
    disconnect: async () => {},
    getNetwork: async () => 'mainnet',
  },
  rabet: {
    isConnected: async () => !!(window as any).rabet,
    connect: async () => {
      const res = await (window as any).rabet.connect();
      return {
        address: res.publicKey,
        publicKey: res.publicKey,
        network: 'mainnet'
      };
    },
    disconnect: async () => {},
    getNetwork: async () => 'mainnet',
  },
  ledger: {
    isConnected: async () => true,
    connect: async () => {
      // Ledger implementation is more complex, keeping it as a stub for now
      throw new Error("Ledger support coming soon");
    },
    disconnect: async () => {},
    getNetwork: async () => 'mainnet',
  }
};

export function useWalletConnection() {
  const [state, setState] = useState<WalletConnectionState>({
    isConnected: false,
    isConnecting: false,
    walletType: null,
    address: null,
    network: null,
    publicKey: null,
    error: null,
    lastConnected: null,
  });

  const [status, setStatus] = useState<WalletConnectionStatus>(WalletConnectionStatus.DISCONNECTED);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved session on mount
  useEffect(() => {
    loadSavedSession();
  }, []);

  // Auto-reconnect logic
  useEffect(() => {
    if (state.walletType && state.address && !state.isConnected && !state.isConnecting) {
      if (reconnectAttempts < SESSION_CONFIG.RECONNECT_ATTEMPTS) {
        attemptReconnect();
      }
    }
  }, [state.walletType, state.address, state.isConnected, state.isConnecting, reconnectAttempts]);

  // Save session when connection state changes
  useEffect(() => {
    if (state.isConnected && state.walletType && state.address && state.network) {
      saveSession({
        walletType: state.walletType,
        address: state.address,
        publicKey: state.publicKey!,
        network: state.network,
        connectedAt: Date.now(),
        expiresAt: Date.now() + SESSION_CONFIG.SESSION_DURATION,
      });
    } else if (!state.isConnected) {
      clearSession();
    }
  }, [state]);

  const loadSavedSession = useCallback(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
      if (savedSession) {
        const session: WalletSession = JSON.parse(savedSession);
        
        // Check if session is still valid
        if (Date.now() < session.expiresAt) {
          setState(prev => ({
            ...prev,
            walletType: session.walletType,
            address: session.address,
            publicKey: session.publicKey,
            network: session.network,
            lastConnected: session.connectedAt,
          }));
          setStatus(WalletConnectionStatus.RECONNECTING);
        } else {
          clearSession();
        }
      }
    } catch (error) {
      console.error('Failed to load saved session:', error);
      clearSession();
    }
  }, []);

  const saveSession = useCallback((session: WalletSession) => {
    try {
      localStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_CONFIG.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }, []);

  const connect = useCallback(async (walletType: WalletType): Promise<boolean> => {
    if (!isWalletSupported(walletType)) {
      const error = getWalletError('WALLET_NOT_INSTALLED', walletType);
      setState(prev => ({ ...prev, error: error.message }));
      setStatus(WalletConnectionStatus.ERROR);
      return false;
    }

    setState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      error: null 
    }));
    setStatus(WalletConnectionStatus.CONNECTING);

    try {
      const provider = walletProviders[walletType];
      
      // Check if wallet is available (in real implementation, this would check if the wallet is installed)
      const isAvailable = await provider.isConnected();
      
      if (!isAvailable && walletType !== 'albedo') {
        throw new Error('Wallet not installed or unavailable');
      }

      // Connect to wallet
      const connection = await provider.connect();
      
      // Validate address
      if (!validateStellarAddress(connection.address)) {
        const error = getWalletError('INVALID_ADDRESS', walletType);
        setState(prev => ({ 
          ...prev, 
          isConnecting: false, 
          error: error.message 
        }));
        setStatus(WalletConnectionStatus.ERROR);
        return false;
      }

      // Validate network
      if (!isNetworkSupported(connection.network)) {
        const error = getWalletError('NETWORK_NOT_SUPPORTED', walletType);
        setState(prev => ({ 
          ...prev, 
          isConnecting: false, 
          error: error.message 
        }));
        setStatus(WalletConnectionStatus.ERROR);
        return false;
      }

      // Success
      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        walletType,
        address: connection.address,
        publicKey: connection.publicKey,
        network: connection.network,
        error: null,
        lastConnected: Date.now(),
      }));
      setStatus(WalletConnectionStatus.CONNECTED);
      setReconnectAttempts(0);

      return true;

    } catch (error) {
      console.error('Wallet connection failed:', error);
      
      let errorCode: keyof typeof WALLET_ERRORS = 'WALLET_CONNECTION_FAILED';
      let errorMessage = '';

      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes('locked')) {
          errorCode = 'WALLET_LOCKED';
        } else if (error.message.includes('permission')) {
          errorCode = 'WALLET_NO_PERMISSIONS';
        }
      }

      const walletError = getWalletError(errorCode, walletType);
      setState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: errorMessage || walletError.message 
      }));
      setStatus(WalletConnectionStatus.ERROR);

      return false;
    }
  }, []);

  const disconnect = useCallback(async (): Promise<void> => {
    try {
      if (state.walletType && walletProviders[state.walletType]) {
        await walletProviders[state.walletType].disconnect();
      }
    } catch (error) {
      console.error('Wallet disconnect failed:', error);
    }

    setState({
      isConnected: false,
      isConnecting: false,
      walletType: null,
      address: null,
      network: null,
      publicKey: null,
      error: null,
      lastConnected: null,
    });
    setStatus(WalletConnectionStatus.DISCONNECTED);
    setReconnectAttempts(0);
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, [state.walletType]);

  const switchNetwork = useCallback(async (network: NetworkType): Promise<boolean> => {
    if (!state.isConnected || !state.walletType) {
      return false;
    }

    if (!isNetworkSupported(network)) {
      const error = getWalletError('NETWORK_NOT_SUPPORTED', state.walletType);
      setState(prev => ({ ...prev, error: error.message }));
      return false;
    }

    try {
      const provider = walletProviders[state.walletType];
      // Note: Stellar wallets often handle network switching within their own UI
      // but we update our state to reflect the intent
      
      setState(prev => ({ ...prev, network }));
      return true;

    } catch (error) {
      console.error('Network switch failed:', error);
      const walletError = getWalletError('NETWORK_MISMATCH', state.walletType);
      setState(prev => ({ ...prev, error: walletError.message }));
      return false;
    }
  }, [state.isConnected, state.walletType]);

  const attemptReconnect = useCallback(() => {
    if (!state.walletType) return;

    setStatus(WalletConnectionStatus.RECONNECTING);
    setReconnectAttempts(prev => prev + 1);

    reconnectTimeoutRef.current = setTimeout(async () => {
      const success = await connect(state.walletType!);
      if (!success && reconnectAttempts < SESSION_CONFIG.RECONNECT_ATTEMPTS - 1) {
        // Try again after delay
        setTimeout(() => attemptReconnect(), SESSION_CONFIG.RECONNECT_DELAY * (reconnectAttempts + 1));
      } else if (!success) {
        // Max attempts reached, show session expired error
        const error = getWalletError('SESSION_EXPIRED', state.walletType!);
        setState(prev => ({ ...prev, error: error.message }));
        setStatus(WalletConnectionStatus.ERROR);
      }
    }, SESSION_CONFIG.RECONNECT_DELAY);
  }, [state.walletType, reconnectAttempts, connect]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
    if (status === WalletConnectionStatus.ERROR) {
      setStatus(state.isConnected ? WalletConnectionStatus.CONNECTED : WalletConnectionStatus.DISCONNECTED);
    }
  }, [status, state.isConnected]);

  const refreshConnection = useCallback(async (): Promise<boolean> => {
    if (!state.walletType) return false;
    
    setReconnectAttempts(0);
    return await connect(state.walletType);
  }, [state.walletType, connect]);

  // Computed values
  const walletConfig = state.walletType ? getWalletConfig(state.walletType) : null;
  const networkConfig = state.network ? getNetworkConfig(state.network) : null;
  const formattedAddress = state.address ? formatWalletAddress(state.address) : '';
  const isReconnecting = status === WalletConnectionStatus.RECONNECTING;
  const canRetry = status === WalletConnectionStatus.ERROR && reconnectAttempts < SESSION_CONFIG.RECONNECT_ATTEMPTS;

  return {
    // State
    state,
    status,
    reconnectAttempts,
    
    // Computed values
    walletConfig,
    networkConfig,
    formattedAddress,
    isReconnecting,
    canRetry,
    
    // Actions
    connect,
    disconnect,
    switchNetwork,
    clearError,
    refreshConnection,
    
    // Helpers
    isWalletSupported,
    isNetworkSupported,
    validateStellarAddress,
  };
}
