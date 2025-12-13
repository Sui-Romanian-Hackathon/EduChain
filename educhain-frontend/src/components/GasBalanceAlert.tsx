"use client"

import { useEffect, useState } from "react"
import { Alert, Button, Group, Stack, Text } from "@mantine/core"
import { IconAlertCircle, IconExternalLink } from "@tabler/icons-react"
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { APP_CONFIG } from "@/lib/config"

export function GasBalanceAlert() {
	const account = useCurrentAccount()
	const client = useSuiClient()
	const [balance, setBalance] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!account?.address) {
			setBalance(null)
			setLoading(false)
			return
		}

		let cancelled = false

		async function fetchBalance() {
			try {
				// Use getBalance for more reliable balance fetching
				// It handles pagination automatically and returns total balance
				const balanceResult = await client.getBalance({
					owner: account!.address,
					coinType: "0x2::sui::SUI"
				})

				// Convert from MIST to SUI (1 SUI = 10^9 MIST)
				const totalBalance = BigInt(balanceResult.totalBalance || 0)
				const suiBalance = Number(totalBalance) / 1_000_000_000

				if (!cancelled) {
					setBalance(suiBalance.toFixed(4))
					setLoading(false)
				}
			} catch (error) {
				console.error("Failed to fetch balance:", error)
				console.error("Account address:", account!.address)
				console.error("Network:", APP_CONFIG.network)
				if (!cancelled) {
					setLoading(false)
				}
			}
		}

		fetchBalance()

		return () => {
			cancelled = true
		}
	}, [account?.address, client])

	if (!account || loading) {
		return null
	}

	// Show balance even if null (to help debug)
	const balanceNum = balance ? parseFloat(balance) : 0
	const lowBalance = balanceNum < 0.1 // Less than 0.1 SUI is considered low

	// If balance is null, show error state
	if (balance === null) {
		return (
			<Alert icon={<IconAlertCircle size={18} />} title="Balance Check Failed" color="orange" radius="lg" mb="md">
				<Text size="sm">Could not fetch balance. Check browser console for details.</Text>
				<Text size="xs" mt="xs" c="dimmed">
					Wallet: <code>{account.address}</code> | Network: {APP_CONFIG.network}
				</Text>
			</Alert>
		)
	}

	// Only show alert if balance is low
	if (!lowBalance) {
		return null
	}

	// Sui faucet info for test networks
	const getFaucetInfo = () => {
		if (APP_CONFIG.network === "testnet") {
			return {
				url: null, // No direct link - use API or Discord
				method: "API or Discord",
				instructions: 'Click "Get Test SUI" button or join Sui Discord and use /faucet command in #testnet-faucet channel'
			}
		}
		if (APP_CONFIG.network === "devnet") {
			return {
				url: "https://discord.com/channels/916379725201563759/971488439931392130",
				method: "Discord",
				instructions: "Use /faucet command in Sui Discord #devnet-faucet channel"
			}
		}
		if (APP_CONFIG.network === "localnet") {
			return {
				url: null,
				method: "CLI",
				instructions: "Run: sui client faucet (in your terminal)"
			}
		}
		return null
	}

	const faucetInfo = getFaucetInfo()

	return (
		<Alert icon={<IconAlertCircle size={18} />} title="Low Gas Balance" color="yellow" radius="lg" mb="md">
			<Stack gap="sm">
				<div>
					<Text size="sm" mb="xs">
						Your wallet has <strong>{balance} SUI</strong>. You need SUI tokens to pay for transaction gas fees.
					</Text>
					{faucetInfo && (
						<Text size="xs" c="dimmed">
							<strong>How to get test SUI:</strong> {faucetInfo.instructions}
						</Text>
					)}
				</div>
				{faucetInfo?.url && (
					<>
						<Button
							component="a"
							href={faucetInfo.url}
							target="_blank"
							rel="noopener noreferrer"
							size="xs"
							variant="light"
							rightSection={<IconExternalLink size={14} />}
							style={{ alignSelf: "flex-start" }}
							visibleFrom="sm"
						>
							Open Faucet
						</Button>
						<Button
							component="a"
							href={faucetInfo.url}
							target="_blank"
							rel="noopener noreferrer"
							size="xs"
							variant="light"
							rightSection={<IconExternalLink size={14} />}
							fullWidth
							hiddenFrom="sm"
						>
							Open Faucet
						</Button>
					</>
				)}
			</Stack>
			{faucetInfo && !faucetInfo.url && (
				<Text size="xs" mt="xs" c="dimmed">
					<strong>For localnet:</strong> Open your terminal and run: <code>sui client faucet</code>
				</Text>
			)}
		</Alert>
	)
}
