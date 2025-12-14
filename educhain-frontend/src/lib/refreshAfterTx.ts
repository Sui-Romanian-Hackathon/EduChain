import type { QueryClient } from "@tanstack/react-query"

const SUI_METHODS_TO_INVALIDATE = new Set<string>([
	"getOwnedObjects",
	"queryEvents",
	"getObject",
	"multiGetObjects",
	"getBalance"
])

function isString(x: unknown): x is string {
	return typeof x === "string"
}

/**
 * Wait for a transaction to finalize, then invalidate cached queries so UI updates without manual refresh.
 *
 * This targets:
 * - Sui RPC queries used by `useSuiClientQuery` (queryKey: [network, method, params, ...])
 * - Backend event queries (queryKey starts with: ["backend-events", ...])
 */
export async function refreshAfterTx(params: {
	queryClient: QueryClient
	client: { waitForTransactionBlock: (args: { digest: string }) => Promise<unknown> }
	digest?: string
}) {
	const { queryClient, client, digest } = params

	// Best-effort: wait for effects so subsequent queries see the updated chain state.
	if (digest) {
		try {
			await client.waitForTransactionBlock({ digest })
		} catch {
			// ignore (network hiccup, already finalized, etc.)
		}
	}

	await queryClient.invalidateQueries({
		predicate: (q) => {
			const key = q.queryKey
			if (!Array.isArray(key) || key.length === 0) return false

			// Our backend event fetchers:
			if (key[0] === "backend-events") return true

			// Mysten dapp-kit Sui queries:
			// queryKey: [network, method, params, ...]
			const method = key.length >= 2 ? key[1] : undefined
			if (isString(method) && SUI_METHODS_TO_INVALIDATE.has(method)) return true

			return false
		}
	})
}


