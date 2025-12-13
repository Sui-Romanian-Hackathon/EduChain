'use client';

import { useMemo } from 'react';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { APP_CONFIG } from './config';
import { extractFields, parseU64, structType } from './sui';
import type { Certificate } from './types';

export function useCertificates(limit = 50) {
  const account = useCurrentAccount();
  const enabled = Boolean(account?.address && APP_CONFIG.packageId);

  const certType = useMemo(() => (APP_CONFIG.packageId ? structType('educhain', 'Certificate') : ''), []);

  const owned = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: account?.address ?? '',
      filter: { StructType: certType },
      options: { showContent: true, showType: true },
      limit,
    },
    { enabled: enabled && Boolean(certType) },
  );

  const certificates: Certificate[] = useMemo(() => {
    const items = owned.data?.data ?? [];
    const parsed: Certificate[] = [];

    for (const item of items) {
      const fields = extractFields(item);
      const objectId = item?.data?.objectId ? String(item.data.objectId) : null;
      if (!objectId || !fields) continue;

      const courseId = parseU64(fields.course_id);
      const score = parseU64(fields.score);
      if (courseId == null || score == null) continue;

      parsed.push({
        objectId,
        courseId,
        score,
        metadataUri: fields.metadata_uri ? String(fields.metadata_uri) : undefined,
      });
    }

    return parsed;
  }, [owned.data]);

  return { ...owned, certificates };
}


