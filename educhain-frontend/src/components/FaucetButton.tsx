"use client"

import { useState } from "react"
import { Button } from "@mantine/core"
import { IconCoins } from "@tabler/icons-react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { APP_CONFIG } from "@/lib/config"
import { notifications } from "@mantine/notifications"

export function FaucetButton() {
	const account = useCurrentAccount()
	const [loading, setLoading] = useState(false)

	const handleFaucet = async () => {
		if (!account?.address) {
			notifications.show({
				color: "yellow",
				title: "Wallet not connected",
				message: "Please connect your wallet first"
			})
			return
		}

		const network = APP_CONFIG.network

		// Copy address to clipboard
		navigator.clipboard.writeText(account.address)

		if (network === "testnet") {
			setLoading(true)
			try {
				// Try Sui testnet faucet API
				const response = await fetch("https://faucet.testnet.sui.io/gas", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({
						FixedAmountRequest: {
							recipient: account.address
						}
					})
				})

				if (response.ok) {
					const data = await response.json()
					notifications.show({
						color: "green",
						title: "Success!",
						message: "Test SUI tokens have been requested. They should arrive shortly."
					})
				} else {
					throw new Error("Faucet API request failed")
				}
			} catch (error) {
				// If API fails, show instructions
				notifications.show({
					color: "blue",
					title: "Get Test SUI",
					message: `Your address (${account.address.slice(
						0,
						8
					)}...) has been copied. Join Sui Discord and use !faucet <address> command in #testnet-faucet channel.`,
					autoClose: 8000
				})
			} finally {
				setLoading(false)
			}
		} else if (network === "devnet") {
			notifications.show({
				color: "blue",
				title: "Get Test SUI",
				message: `Your address has been copied. Join Sui Discord (https://discord.gg/sui) and use !faucet <address> command in #devnet-faucet channel.`,
				autoClose: 8000
			})
		} else if (network === "localnet") {
			notifications.show({
				color: "blue",
				title: "Localnet Faucet",
				message: 'Run "sui client faucet" in your terminal. Your address has been copied.'
			})
		} else {
			notifications.show({
				color: "red",
				title: "Faucet not available",
				message: `Faucet is not available for ${network} network`
			})
		}
	}

	if (!account) {
		return null
	}

	return (
		<>
			<Button
				size="xs"
				variant="light"
				leftSection={<IconCoins size={16} />}
				onClick={handleFaucet}
				loading={loading}
				disabled={loading}
				visibleFrom="sm"
			>
				Get Test SUI
			</Button>
			<Button
				size="xs"
				variant="light"
				leftSection={<IconCoins size={14} />}
				onClick={handleFaucet}
				loading={loading}
				disabled={loading}
				hiddenFrom="sm"
				px="xs"
			>
				Faucet
			</Button>
		</>
	)
}
