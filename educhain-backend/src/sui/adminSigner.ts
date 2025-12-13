import { CONFIG } from '../config.js';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';

/**
 * ADMIN_PRIVATE_KEY formats:
 * - base64: typical Sui keystore secretKey bytes
 * - hex:   0x... (will be treated as raw bytes)
 *
 * For demos only. Prefer admin actions with a wallet or multisig in production.
 */
export function getAdminKeypairOrNull(): Ed25519Keypair | null {
  const key = CONFIG.ADMIN_PRIVATE_KEY?.trim();
  if (!key) return null;

  try {
    if (key.startsWith('0x')) {
      const hex = key.slice(2);
      const bytes = Uint8Array.from(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
      return Ed25519Keypair.fromSecretKey(bytes);
    }

    // base64
    return Ed25519Keypair.fromSecretKey(fromB64(key));
  } catch (e) {
    throw new Error(`Invalid ADMIN_PRIVATE_KEY: ${(e as Error).message}`);
  }
}
