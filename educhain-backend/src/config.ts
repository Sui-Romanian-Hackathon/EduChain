import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(8080),
  LOG_LEVEL: z.string().default('info'),

  DATABASE_URL: z.string().min(1),

  SUI_NETWORK: z.enum(['localnet', 'devnet', 'testnet', 'mainnet']).default('testnet'),
  SUI_RPC_URL: z.string().optional().default(''),
  SUI_PACKAGE_ID: z.string().min(1),
  SUI_COURSE_CATALOG_ID: z.string().optional().default(''),
  SUI_PROPOSAL_REGISTRY_ID: z.string().optional().default(''),

  // Optional: capability object IDs for demo server-side signing
  SUI_TEACHER_CAP_ID: z.string().optional().default(''),
  SUI_ADMIN_CAP_ID: z.string().optional().default(''),
  SUI_ISSUER_CAP_ID: z.string().optional().default(''),

  INDEXER_POLL_INTERVAL_MS: z.coerce.number().default(2500),
  INDEXER_EVENT_FILTER_MODE: z.enum(['package', 'module', 'eventType']).default('package'),
  INDEXER_MODULE_NAME: z.string().default('educhain'),
  INDEXER_EVENT_TYPE: z.string().optional().default(''),

  ADMIN_PRIVATE_KEY: z.string().optional().default(''),
});

export const CONFIG = EnvSchema.parse(process.env);
