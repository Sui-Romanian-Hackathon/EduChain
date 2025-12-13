import { CONFIG } from '../config.js';
import { getSuiClient } from '../sui/client.js';
import { buildEventFilter } from '../sui/filters.js';
import { getCursor, setCursor } from './cursor.js';
import { persistEvent } from './handlers.js';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tick() {
  const client = getSuiClient();
  const filter = buildEventFilter();

  let cursor = await getCursor();

  const resp = await client.queryEvents({
    query: filter,
    cursor,
    limit: 100,
    order: 'ascending',
  });

  if (resp.data.length === 0) return;

  for (const e of resp.data) {
    await persistEvent(e);
    if (e.id?.txDigest && e.id.eventSeq !== undefined && e.id.eventSeq !== null) {
      cursor = { txDigest: e.id.txDigest, eventSeq: e.id.eventSeq };
    }
  }

  if (cursor) await setCursor(cursor);
}

async function main() {
  console.log('[indexer] starting with config:', {
    network: CONFIG.SUI_NETWORK,
    rpcUrl: CONFIG.SUI_RPC_URL || '(derived)',
    packageId: CONFIG.SUI_PACKAGE_ID,
    filterMode: CONFIG.INDEXER_EVENT_FILTER_MODE,
  });

  while (true) {
    try {
      await tick();
    } catch (e) {
      console.error('[indexer] error:', e);
      // backoff on errors
      await sleep(Math.min(CONFIG.INDEXER_POLL_INTERVAL_MS * 4, 15_000));
    }
    await sleep(CONFIG.INDEXER_POLL_INTERVAL_MS);
  }
}

main().catch((e) => {
  console.error('[indexer] fatal:', e);
  process.exit(1);
});
