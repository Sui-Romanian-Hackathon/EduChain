import { Transaction } from '@mysten/sui/transactions';
import type { SuiClient } from '@mysten/sui/client';
import { APP_CONFIG } from './config';

/**
 * NOTE about shared objects:
 * For wallet-based execution (dApp Kit), you can usually pass shared object IDs
 * directly with tx.object(<id>). The wallet/provider resolves the shared object
 * reference at build time.
 */

export function moveTarget(module: string, fn: string) {
  if (!APP_CONFIG.packageId) throw new Error('Missing NEXT_PUBLIC_SUI_PACKAGE_ID');
  return `${APP_CONFIG.packageId}::${module}::${fn}`;
}

export function structType(module: string, struct: string) {
  if (!APP_CONFIG.packageId) throw new Error('Missing NEXT_PUBLIC_SUI_PACKAGE_ID');
  return `${APP_CONFIG.packageId}::${module}::${struct}`;
}

export async function buildCreateProfileTx(_client: SuiClient) {
  const tx = new Transaction();
  tx.moveCall({
    target: moveTarget('educhain', 'create_profile'),
    arguments: [],
  });
  return tx;
}

export async function buildEnrollTx(_client: SuiClient, args: { profileId: string; courseId: string | number }) {
  if (!APP_CONFIG.courseCatalogId) throw new Error('Missing NEXT_PUBLIC_COURSE_CATALOG_ID');

  const tx = new Transaction();
  tx.moveCall({
    target: moveTarget('educhain', 'enroll'),
    arguments: [tx.object(APP_CONFIG.courseCatalogId), tx.object(args.profileId), tx.pure.u64(args.courseId)],
  });
  return tx;
}

export async function buildVoteTx(
  _client: SuiClient,
  args: { profileId: string; proposalId: string | number; choice: 0 | 1 },
) {
  if (!APP_CONFIG.proposalRegistryId) throw new Error('Missing NEXT_PUBLIC_PROPOSAL_REGISTRY_ID');

  const tx = new Transaction();
  tx.moveCall({
    target: moveTarget('educhain', 'vote'),
    arguments: [
      tx.object(APP_CONFIG.proposalRegistryId),
      tx.object(args.profileId),
      tx.pure.u64(args.proposalId),
      tx.pure.u8(args.choice),
    ],
  });
  return tx;
}

export async function buildCreateCourseTx(
  _client: SuiClient,
  args: { teacherCapId: string; title: string; contentUri: string },
) {
  if (!APP_CONFIG.courseCatalogId) throw new Error('Missing NEXT_PUBLIC_COURSE_CATALOG_ID');

  const tx = new Transaction();
  tx.moveCall({
    target: moveTarget('educhain', 'create_course'),
    arguments: [
      tx.object(args.teacherCapId),
      tx.object(APP_CONFIG.courseCatalogId),
      tx.pure.string(args.title),
      tx.pure.string(args.contentUri),
    ],
  });

  return tx;
}

export async function buildCreateProposalTx(
  _client: SuiClient,
  args: { adminCapId: string; title: string; description: string },
) {
  if (!APP_CONFIG.proposalRegistryId) throw new Error('Missing NEXT_PUBLIC_PROPOSAL_REGISTRY_ID');

  const tx = new Transaction();
  tx.moveCall({
    target: moveTarget('educhain', 'create_proposal'),
    arguments: [
      tx.object(args.adminCapId),
      tx.object(APP_CONFIG.proposalRegistryId),
      tx.pure.string(args.title),
      tx.pure.string(args.description),
    ],
  });

  return tx;
}

export async function buildIssueCertificateTx(
  _client: SuiClient,
  args: { issuerCapId: string; courseId: string | number; student: string; metadataUri: string },
) {
  if (!APP_CONFIG.courseCatalogId) throw new Error('Missing NEXT_PUBLIC_COURSE_CATALOG_ID');

  const tx = new Transaction();
  tx.moveCall({
    target: moveTarget('educhain', 'issue_certificate'),
    arguments: [
      tx.object(args.issuerCapId),
      tx.object(APP_CONFIG.courseCatalogId),
      tx.pure.u64(args.courseId),
      tx.pure.address(args.student),
      tx.pure.string(args.metadataUri),
    ],
  });
  return tx;
}

export async function buildSubmitResultAndIssueCertificateTx(
  _client: SuiClient,
  args: {
    teacherCapId: string;
    issuerCapId: string;
    courseId: string | number;
    student: string;
    score: string | number;
    metadataUri: string;
  },
) {
  if (!APP_CONFIG.courseCatalogId) throw new Error('Missing NEXT_PUBLIC_COURSE_CATALOG_ID');

  const tx = new Transaction();

  // 1) Mark completed + record score
  tx.moveCall({
    target: moveTarget('educhain', 'submit_result'),
    arguments: [
      tx.object(args.teacherCapId),
      tx.object(APP_CONFIG.courseCatalogId),
      tx.pure.u64(args.courseId),
      tx.pure.address(args.student),
      tx.pure.bool(true),
      tx.pure.u64(args.score),
    ],
  });

  // 2) Issue the certificate (same tx => sees the updated on-chain state)
  tx.moveCall({
    target: moveTarget('educhain', 'issue_certificate'),
    arguments: [
      tx.object(args.issuerCapId),
      tx.object(APP_CONFIG.courseCatalogId),
      tx.pure.u64(args.courseId),
      tx.pure.address(args.student),
      tx.pure.string(args.metadataUri),
    ],
  });

  return tx;
}

export async function buildSubmitResultTx(
  _client: SuiClient,
  args: {
    teacherCapId: string;
    courseId: string | number;
    student: string;
    completed: boolean;
    score: string | number;
  },
) {
  if (!APP_CONFIG.courseCatalogId) throw new Error('Missing NEXT_PUBLIC_COURSE_CATALOG_ID');

  const tx = new Transaction();
  tx.moveCall({
    target: moveTarget('educhain', 'submit_result'),
    arguments: [
      tx.object(args.teacherCapId),
      tx.object(APP_CONFIG.courseCatalogId),
      tx.pure.u64(args.courseId),
      tx.pure.address(args.student),
      tx.pure.bool(args.completed),
      tx.pure.u64(args.score),
    ],
  });
  return tx;
}

export function extractFields(obj: any): Record<string, any> | null {
  const content = obj?.data?.content;
  if (!content || typeof content !== 'object') return null;
  const fields = (content as any).fields;
  if (!fields || typeof fields !== 'object') return null;
  return fields as Record<string, any>;
}

export function parseU64(value: any): number | null {
  if (value == null) return null;
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(n) ? n : null;
}
