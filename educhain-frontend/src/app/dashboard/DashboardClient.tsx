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

type Tab = 'courses' | 'proposals' | 'profile' | 'admin';

function DashboardContent() {
  const params = useSearchParams();
  const tab = useMemo(() => {
    const t = (params.get('tab') ?? 'courses') as Tab;
    if (t === 'courses' || t === 'proposals' || t === 'profile' || t === 'admin') return t;
    return 'courses';
  }, [params]);

  return (
    <AppShellLayout active={tab}>
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Stack gap="md">
          <ConfigAlert />
          <GasBalanceAlert />
          {tab === 'courses' && <CoursesPanel />}
          {tab === 'proposals' && <ProposalsPanel />}
          {tab === 'profile' && <ProfilePanel />}
          {tab === 'admin' && <AdminPanel />}
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


