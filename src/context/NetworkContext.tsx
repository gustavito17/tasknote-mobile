import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Network from 'expo-network';
import { SyncStatus } from '../types';

interface NetworkContextType extends SyncStatus {
  isConnected: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    const checkNetwork = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsOnline(state.isConnected ?? false);
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 5000);

    return () => clearInterval(interval);
  }, []);

  const value: NetworkContextType = {
    isOnline,
    isConnected: isOnline,
    lastSyncAt,
    pendingChanges,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork(): NetworkContextType {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
