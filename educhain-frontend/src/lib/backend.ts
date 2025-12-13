'use client';

import { APP_CONFIG } from './config';

export type BackendEventRow = {
  id: string | number;
  txDigest: string;
  eventSeq: number;
  timestampMs?: string | number | null;
  packageId?: string | null;
  transactionModule?: string | null;
  sender?: string | null;
  eventType?: string | null;
  parsedJson?: any;
};

export async function fetchBackendEvents(params: {
  eventType?: string;
  packageId?: string;
  module?: string;
  sender?: string;
  limit?: number;
  cursor?: string;
}) {
  if (!APP_CONFIG.backendUrl) throw new Error('NEXT_PUBLIC_BACKEND_URL not set');

  const url = new URL('/events', APP_CONFIG.backendUrl);
  if (params.eventType) url.searchParams.set('eventType', params.eventType);
  if (params.packageId) url.searchParams.set('packageId', params.packageId);
  if (params.module) url.searchParams.set('module', params.module);
  if (params.sender) url.searchParams.set('sender', params.sender);
  if (params.limit) url.searchParams.set('limit', String(params.limit));
  if (params.cursor) url.searchParams.set('cursor', params.cursor);

  try {
    const res = await fetch(url.toString(), { 
      cache: 'no-store',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Backend error ${res.status}: ${text || res.statusText}`);
    }
    
    return (await res.json()) as { data: BackendEventRow[]; nextCursor: string | null };
  } catch (error: any) {
    // Handle connection errors gracefully (connection refused, timeout, etc.)
    if (error.name === 'AbortError' || error.name === 'TypeError' || error.message?.includes('fetch')) {
      // Silently fail for connection issues - the hook will fall back to chain
      throw new Error('BACKEND_UNAVAILABLE');
    }
    // Re-throw other errors
    throw error;
  }
}
