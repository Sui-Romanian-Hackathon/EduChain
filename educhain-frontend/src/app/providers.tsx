'use client';

import React from 'react';
import type { MantineThemeOverride } from '@mantine/core';
import { localStorageColorSchemeManager, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { APP_CONFIG } from '@/lib/config';
import { PerimeterGradientAnimator } from '@/components/PerimeterGradientAnimator';

const queryClient = new QueryClient();
const colorSchemeManager = localStorageColorSchemeManager({ key: 'educhain-color-scheme' });

const theme: MantineThemeOverride = {
  primaryColor: 'educhain',
  defaultRadius: 'lg',
  colors: {
    educhain: [
      '#eef2ff',
      '#e0e7ff',
      '#c7d2fe',
      '#a5b4fc',
      '#818cf8',
      '#6366f1',
      '#4f46e5',
      '#4338ca',
      '#3730a3',
      '#312e81',
    ],
  },
  primaryShade: { light: 6, dark: 4 },
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  headings: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    fontWeight: '700',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },
  },
};

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
          <MantineProvider defaultColorScheme="auto" colorSchemeManager={colorSchemeManager} theme={theme}>
            <Notifications position="top-right" />
            <PerimeterGradientAnimator />
            {children}
          </MantineProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
