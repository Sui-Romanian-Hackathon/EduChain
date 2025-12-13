import type { EventId } from '@mysten/sui/client';
import { prisma } from '../db/prisma.js';

export async function getCursor(): Promise<EventId | null> {
  const row = await prisma.indexerCursor.findUnique({ where: { id: 1 } });
  if (!row?.txDigest || row.eventSeq === null || row.eventSeq === undefined) return null;
  return { txDigest: row.txDigest, eventSeq: row.eventSeq };
}

export async function setCursor(cursor: EventId): Promise<void> {
  await prisma.indexerCursor.upsert({
    where: { id: 1 },
    create: { id: 1, txDigest: cursor.txDigest, eventSeq: cursor.eventSeq },
    update: { txDigest: cursor.txDigest, eventSeq: cursor.eventSeq },
  });
}
