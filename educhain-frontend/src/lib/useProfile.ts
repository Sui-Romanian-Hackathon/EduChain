'use client';

import { useMemo } from 'react';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { APP_CONFIG } from './config';
import { extractFields, parseU64, structType } from './sui';
import type { Profile } from './types';

export function useProfile() {
  const account = useCurrentAccount();
  const enabled = Boolean(account?.address && APP_CONFIG.packageId);

  const profileType = useMemo(() => {
    if (!APP_CONFIG.packageId) return '';
    return structType('educhain', 'Profile');
  }, []);

  const owned = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address ?? '',
      filter: { StructType: profileType },
      options: { showContent: true, showType: true },
      limit: 1,
    },
    { enabled },
  );

  const profile: Profile | null = useMemo(() => {
    const data = owned.data;
    const item = data?.data?.[0];
    const fields = extractFields(item);
    if (!item?.data?.objectId || !fields) return null;

    const eduPoints = parseU64(fields.edu_points) ?? 0;
    const civicPoints = parseU64(fields.civic_points) ?? 0;

    const completedCourses = Array.isArray(fields.completed_courses)
      ? fields.completed_courses.map((x: any) => parseU64(x)).filter((x: any): x is number => x != null)
      : [];

    const votedProposals = Array.isArray(fields.voted_proposals)
      ? fields.voted_proposals.map((x: any) => parseU64(x)).filter((x: any): x is number => x != null)
      : [];

    return {
      objectId: item.data.objectId,
      eduPoints,
      civicPoints,
      completedCourses,
      votedProposals,
    };
  }, [owned.data]);

  return { ...owned, profile, address: account?.address ?? null };
}
