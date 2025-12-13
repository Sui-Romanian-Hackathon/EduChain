'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentAccount, useSuiClient, useSuiClientQuery } from '@mysten/dapp-kit';
import { APP_CONFIG } from './config';
import { fetchBackendEvents, type BackendEventRow } from './backend';
import { parseU64, structType } from './sui';

type ChainEvent = {
  type: string;
  parsedJson?: any;
  timestampMs?: string;
};

export type EnrollmentView = {
  courseId: number;
  enrolledAtMs?: number;
};

export function useEnrollments(limit = 200) {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const enabled = Boolean(account?.address && APP_CONFIG.packageId);

  const eventType = useMemo(() => (APP_CONFIG.packageId ? structType('educhain', 'Enrolled') : ''), []);

  const backend = useQuery<{ data: BackendEventRow[]; nextCursor: string | null }>({
    queryKey: ['backend-events', 'enrollments', eventType, limit, account?.address, APP_CONFIG.backendUrl],
    enabled: enabled && Boolean(APP_CONFIG.backendUrl) && Boolean(eventType),
    queryFn: () => fetchBackendEvents({ eventType, limit }),
    staleTime: 10_000,
    retry: false,
    refetchOnWindowFocus: false,
    retryOnMount: false,
    throwOnError: false,
  });

  const chain = useSuiClientQuery(
    'queryEvents',
    {
      query: { MoveEventType: eventType },
      limit,
      order: 'descending',
    },
    { enabled: enabled && Boolean(eventType) },
  );

  const rawEvents: ChainEvent[] | null = useMemo(() => {
    if (APP_CONFIG.backendUrl && backend.data && !backend.error) {
      const rows = backend.data.data ?? [];
      return rows.map((r: BackendEventRow) => ({
        type: r.eventType ?? eventType,
        parsedJson: r.parsedJson ?? {},
        timestampMs: r.timestampMs != null ? String(r.timestampMs) : undefined,
      }));
    }
    return (chain.data?.data ?? []) as any;
  }, [backend.data, backend.error, chain.data, eventType]);

  const isLoading = (APP_CONFIG.backendUrl && !backend.error ? backend.isPending : chain.isPending) || false;

  // Only show chain errors (backend errors are silently ignored since we fall back)
  const error = chain.error as any;

  const [enrollments, setEnrollments] = useState<EnrollmentView[]>([]);

  useEffect(() => {
    const addr = account?.address;
    if (!addr || !rawEvents?.length) {
      setEnrollments([]);
      return;
    }

    const byCourse = new Map<number, EnrollmentView>();
    for (const e of rawEvents) {
      const pj = e.parsedJson ?? {};
      const student = pj.student ? String(pj.student) : null;
      if (!student || student !== addr) continue;
      const courseId = parseU64(pj.course_id);
      if (courseId == null) continue;
      if (byCourse.has(courseId)) continue;
      const enrolledAtMs = e.timestampMs ? Number(e.timestampMs) : undefined;
      byCourse.set(courseId, { courseId, enrolledAtMs });
    }

    // Sort newest first (best-effort)
    const list = [...byCourse.values()].sort((a, b) => (b.enrolledAtMs ?? 0) - (a.enrolledAtMs ?? 0));
    setEnrollments(list);
  }, [account?.address, rawEvents]);

  // Keep `client` referenced so hook re-runs when network/client changes
  void client;

  return {
    enrollments,
    loading: isLoading,
    error,
    source: APP_CONFIG.backendUrl && backend.data && !backend.error ? 'backend' : 'chain',
  } as const;
}


