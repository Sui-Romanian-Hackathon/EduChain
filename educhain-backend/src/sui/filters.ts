import type { SuiEventFilter } from '@mysten/sui/client';
import { CONFIG } from '../config.js';

/**
 * Build a QueryEvents filter.
 *
 * For hackathon MVP, filtering by package or module is usually enough.
 * If your events are very noisy, use `eventType`.
 */
export function buildEventFilter(): SuiEventFilter {
  switch (CONFIG.INDEXER_EVENT_FILTER_MODE) {
    case 'module':
      return {
        MoveModule: {
          package: CONFIG.SUI_PACKAGE_ID,
          module: CONFIG.INDEXER_MODULE_NAME,
        },
      };
    case 'eventType':
      if (!CONFIG.INDEXER_EVENT_TYPE) {
        throw new Error('INDEXER_EVENT_TYPE is required when INDEXER_EVENT_FILTER_MODE=eventType');
      }
      return { MoveEventType: CONFIG.INDEXER_EVENT_TYPE };
    case 'package':
    default:
      return { MovePackage: CONFIG.SUI_PACKAGE_ID };
  }
}
