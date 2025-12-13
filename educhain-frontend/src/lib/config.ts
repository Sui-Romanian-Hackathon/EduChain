export type SuiNetwork = "localnet" | "devnet" | "testnet" | "mainnet"

// Read env vars directly - Next.js replaces NEXT_PUBLIC_* vars at build/dev time
// Using the simplest possible access pattern that Next.js can statically replace
const getEnvValue = (key: string): string => {
	// Access process.env directly - Next.js will replace NEXT_PUBLIC_* vars
	const value = process.env[key]
	if (!value || typeof value !== "string") {
		return ""
	}
	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : ""
}

// Read each env var directly using string literals
// This is the pattern Next.js can statically analyze and replace
const networkRaw = process.env.NEXT_PUBLIC_SUI_NETWORK
const rpcUrlRaw = process.env.NEXT_PUBLIC_SUI_RPC_URL
const backendUrlRaw = process.env.NEXT_PUBLIC_BACKEND_URL
const packageIdRaw = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID
const catalogIdRaw = process.env.NEXT_PUBLIC_COURSE_CATALOG_ID
const registryIdRaw = process.env.NEXT_PUBLIC_PROPOSAL_REGISTRY_ID

// Process and validate values
const networkValue =
	networkRaw && typeof networkRaw === "string" && networkRaw.trim() ? (networkRaw.trim() as SuiNetwork) : "testnet"

const rpcUrlValue = rpcUrlRaw && typeof rpcUrlRaw === "string" && rpcUrlRaw.trim() ? rpcUrlRaw.trim() : undefined

const backendUrlValue =
	backendUrlRaw && typeof backendUrlRaw === "string" && backendUrlRaw.trim() ? backendUrlRaw.trim() : undefined

const packageIdValue = packageIdRaw && typeof packageIdRaw === "string" && packageIdRaw.trim() ? packageIdRaw.trim() : ""

const catalogIdValue = catalogIdRaw && typeof catalogIdRaw === "string" && catalogIdRaw.trim() ? catalogIdRaw.trim() : ""

const registryIdValue = registryIdRaw && typeof registryIdRaw === "string" && registryIdRaw.trim() ? registryIdRaw.trim() : ""

// Debug logging in development
if (process.env.NODE_ENV === "development") {
	console.log("[Config] Environment variables:", {
		NEXT_PUBLIC_SUI_NETWORK: networkRaw || "undefined",
		NEXT_PUBLIC_SUI_PACKAGE_ID: packageIdRaw ? `${packageIdRaw.slice(0, 10)}...` : "undefined",
		NEXT_PUBLIC_COURSE_CATALOG_ID: catalogIdRaw ? `${catalogIdRaw.slice(0, 10)}...` : "undefined",
		NEXT_PUBLIC_PROPOSAL_REGISTRY_ID: registryIdRaw ? `${registryIdRaw.slice(0, 10)}...` : "undefined"
	})
}

// Export config object
export const APP_CONFIG = {
	network: networkValue,
	rpcUrl: rpcUrlValue,
	backendUrl: backendUrlValue,
	packageId: packageIdValue,
	courseCatalogId: catalogIdValue,
	proposalRegistryId: registryIdValue
}

export function suiChainId(network: SuiNetwork): `sui:${SuiNetwork}` {
	return `sui:${network}`
}

export function requiredConfigMissing(): string[] {
	const missing: string[] = []
	if (!APP_CONFIG.packageId) missing.push("NEXT_PUBLIC_SUI_PACKAGE_ID")
	if (!APP_CONFIG.courseCatalogId) missing.push("NEXT_PUBLIC_COURSE_CATALOG_ID")
	if (!APP_CONFIG.proposalRegistryId) missing.push("NEXT_PUBLIC_PROPOSAL_REGISTRY_ID")
	return missing
}

export function shortAddress(addr?: string | null) {
	if (!addr) return ""
	return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
