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

export type ResultView = {
  courseId: number;
  completed: boolean;
  score?: number;
  updatedAtMs?: number;
};

export function useResults(limit = 500) {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const enabled = Boolean(account?.address && APP_CONFIG.packageId);

  const eventType = useMemo(() => (APP_CONFIG.packageId ? structType('educhain', 'ResultSubmitted') : ''), []);

  const backend = useQuery<{ data: BackendEventRow[]; nextCursor: string | null }>({
    queryKey: ['backend-events', 'results', eventType, limit, account?.address, APP_CONFIG.backendUrl],
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

  const isLoading = APP_CONFIG.backendUrl && !backend.error ? backend.isPending : chain.isPending;
  const error = chain.error as any;

  const [results, setResults] = useState<ResultView[]>([]);

  useEffect(() => {
    const addr = account?.address;
    if (!addr || !rawEvents?.length) {
      setResults([]);
      return;
    }

    // Keep latest by (courseId, student). Since we filter to this student, key is courseId.
    const byCourse = new Map<number, ResultView>();
    for (const e of rawEvents) {
      const pj = e.parsedJson ?? {};
      const student = pj.student ? String(pj.student) : null;
      if (!student || student !== addr) continue;
      const courseId = parseU64(pj.course_id);
      if (courseId == null) continue;

      const completed = Boolean(pj.completed);
      const score = parseU64(pj.score) ?? undefined;
      const updatedAtMs = e.timestampMs ? Number(e.timestampMs) : undefined;

      if (!byCourse.has(courseId)) {
        byCourse.set(courseId, { courseId, completed, score, updatedAtMs });
      }
    }

    const list = [...byCourse.values()].sort((a, b) => (b.updatedAtMs ?? 0) - (a.updatedAtMs ?? 0));
    setResults(list);
  }, [account?.address, rawEvents]);

  void client;

  const completedCourseIds = useMemo(() => {
    const s = new Set<number>();
    for (const r of results) if (r.completed) s.add(r.courseId);
    return s;
  }, [results]);

  const resultByCourseId = useMemo(() => {
    const m = new Map<number, ResultView>();
    for (const r of results) m.set(r.courseId, r);
    return m;
  }, [results]);

  return {
    results,
    completedCourseIds,
    resultByCourseId,
    loading: isLoading,
    error,
    source: APP_CONFIG.backendUrl && backend.data && !backend.error ? 'backend' : 'chain',
  } as const;
}


