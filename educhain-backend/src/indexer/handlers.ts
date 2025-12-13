import type { SuiEvent } from '@mysten/sui/client';
import { prisma } from '../db/prisma.js';

/**
 * Generic event persistence.
 * Later: add domain-specific upserts (courses/proposals/certificates tables).
 */
export async function persistEvent(e: SuiEvent) {
  const txDigest = e.id?.txDigest;
  const eventSeq = e.id?.eventSeq;

  if (!txDigest || eventSeq === undefined || eventSeq === null) return;

  await prisma.suiEvent.upsert({
    where: { txDigest_eventSeq: { txDigest, eventSeq } },
    create: {
      txDigest,
      eventSeq,
      timestampMs: e.timestampMs ? BigInt(e.timestampMs) : null,
      packageId: e.packageId ?? null,
      transactionModule: e.transactionModule ?? null,
      sender: e.sender ?? null,
      eventType: e.type ?? null,
      parsedJson: (e.parsedJson as any) ?? null,
      bcs: (e.bcs as any) ?? null,
    },
    update: {
      timestampMs: e.timestampMs ? BigInt(e.timestampMs) : null,
      packageId: e.packageId ?? null,
      transactionModule: e.transactionModule ?? null,
      sender: e.sender ?? null,
      eventType: e.type ?? null,
      parsedJson: (e.parsedJson as any) ?? null,
      bcs: (e.bcs as any) ?? null,
    },
  });
}
