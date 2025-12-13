import { CONFIG } from '../config.js';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

export function getSuiClient(): SuiClient {
  const url = CONFIG.SUI_RPC_URL && CONFIG.SUI_RPC_URL.length > 0
    ? CONFIG.SUI_RPC_URL
    : getFullnodeUrl(CONFIG.SUI_NETWORK);

  return new SuiClient({ url });
}
