'use client';

import { useMemo } from 'react';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { APP_CONFIG } from './config';
import { structType } from './sui';
import type { CapIds } from './types';

export function useCaps() {
  const account = useCurrentAccount();
  const enabled = Boolean(account?.address && APP_CONFIG.packageId);

  const teacherType = useMemo(() => (APP_CONFIG.packageId ? structType('educhain', 'TeacherCap') : ''), []);
  const adminType = useMemo(() => (APP_CONFIG.packageId ? structType('educhain', 'AdminCap') : ''), []);
  const issuerType = useMemo(() => (APP_CONFIG.packageId ? structType('educhain', 'IssuerCap') : ''), []);

  const teacher = useSuiClientQuery(
    'getOwnedObjects',
    { owner: account?.address ?? '', filter: { StructType: teacherType }, limit: 1 },
    { enabled },
  );
  const admin = useSuiClientQuery(
    'getOwnedObjects',
    { owner: account?.address ?? '', filter: { StructType: adminType }, limit: 1 },
    { enabled },
  );
  const issuer = useSuiClientQuery(
    'getOwnedObjects',
    { owner: account?.address ?? '', filter: { StructType: issuerType }, limit: 1 },
    { enabled },
  );

  const caps: CapIds = useMemo(() => {
    const teacherCapId = teacher.data?.data?.[0]?.data?.objectId;
    const adminCapId = admin.data?.data?.[0]?.data?.objectId;
    const issuerCapId = issuer.data?.data?.[0]?.data?.objectId;
    return { teacherCapId, adminCapId, issuerCapId };
  }, [teacher.data, admin.data, issuer.data]);

  return { caps, loading: teacher.isPending || admin.isPending || issuer.isPending };
}
