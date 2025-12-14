'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Stack, Skeleton } from '@mantine/core';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ConfigAlert } from '@/components/ConfigAlert';
import { GasBalanceAlert } from '@/components/GasBalanceAlert';
import { CoursesPanel } from '@/components/panels/CoursesPanel';
import { ProposalsPanel } from '@/components/panels/ProposalsPanel';
import { ProfilePanel } from '@/components/panels/ProfilePanel';
import { AdminPanel } from '@/components/panels/AdminPanel';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCaps } from '@/lib/useCaps';

type Tab = 'courses' | 'proposals' | 'profile' | 'admin';

function DashboardContent() {
  const params = useSearchParams();
  const account = useCurrentAccount();
  const { caps, loading: capsLoading } = useCaps();
  const tab = useMemo(() => {
    const t = (params.get('tab') ?? 'courses') as Tab;
    if (t === 'courses' || t === 'proposals' || t === 'profile' || t === 'admin') return t;
    return 'courses';
  }, [params]);

  const effectiveTab: Tab = useMemo(() => {
    if (!account && (tab === 'profile' || tab === 'admin')) return 'courses';
    if (tab === 'admin') {
      if (capsLoading) return 'courses';
      if (!caps.adminCapId) return 'courses';
    }
    return tab;
  }, [account, caps.adminCapId, capsLoading, tab]);

  return (
    <AppShellLayout active={effectiveTab}>
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Stack gap="md">
          <ConfigAlert />
          <GasBalanceAlert />
          {effectiveTab === 'courses' && <CoursesPanel />}
          {effectiveTab === 'proposals' && <ProposalsPanel />}
          {effectiveTab === 'profile' && <ProfilePanel />}
          {effectiveTab === 'admin' && <AdminPanel />}
        </Stack>
      </Container>
    </AppShellLayout>
  );
}

function DashboardFallback() {
  return (
    <AppShellLayout active="courses">
      <Container size="xl">
        <Stack gap="md">
          <Skeleton height={60} />
          <Skeleton height={200} />
          <Skeleton height={200} />
        </Stack>
      </Container>
    </AppShellLayout>
  );
}

export default function DashboardClient() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}


