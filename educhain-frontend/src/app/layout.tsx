import type { Metadata } from 'next';
import { ColorSchemeScript } from '@mantine/core';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mysten/dapp-kit/dist/index.css';

import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'EduCityChain',
  description: 'Education + civic engagement on Sui',
  icons: {
    icon: '/eduChainLogo.png',
    apple: '/eduChainLogo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
