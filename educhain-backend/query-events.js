#!/usr/bin/env node

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

const eventType = process.argv[2] || '0xb988f592956d7d8e271cfde57aa909e62380f7bec9b7cf2641d522d9002fa4b9::educhain::Initialized';
const limit = parseInt(process.argv[3]) || 1;
const network = process.env.SUI_NETWORK || 'testnet';

const client = new SuiClient({ url: getFullnodeUrl(network) });

try {
  const resp = await client.queryEvents({
    query: { MoveEventType: eventType },
    limit,
    order: 'descending',
  });

  console.log(JSON.stringify(resp, null, 2));
} catch (error) {
  console.error('Error querying events:', error);
  process.exit(1);
}

