'use client';

import React from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { APP_CONFIG } from '@/lib/config';

const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  localnet: { url: APP_CONFIG.rpcUrl ?? getFullnodeUrl('localnet') },
  devnet: { url: APP_CONFIG.rpcUrl ?? getFullnodeUrl('devnet') },
  testnet: { url: APP_CONFIG.rpcUrl ?? getFullnodeUrl('testnet') },
  mainnet: { url: APP_CONFIG.rpcUrl ?? getFullnodeUrl('mainnet') },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={APP_CONFIG.network}>
        <WalletProvider autoConnect>
          <MantineProvider defaultColorScheme="auto">
            <Notifications position="top-right" />
            {children}
          </MantineProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
