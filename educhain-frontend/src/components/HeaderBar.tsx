"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Group, Text, Badge, Menu, Box } from "@mantine/core"
import { IconChevronDown, IconCopy, IconLogOut } from "./icons/feather"
import { ConnectButton, useCurrentAccount, useDisconnectWallet, useSuiClientContext } from "@mysten/dapp-kit"
import { APP_CONFIG, shortAddress } from "@/lib/config"
import { notifications } from "@mantine/notifications"
import { FaucetButton } from "./FaucetButton"

export function HeaderBar() {
	const account = useCurrentAccount()
	const { mutate: disconnect } = useDisconnectWallet()
	const { network } = useSuiClientContext()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const onCopy = async () => {
		if (!account?.address) return
		await navigator.clipboard.writeText(account.address)
		notifications.show({ message: "Address copied" })
	}

	// Always use APP_CONFIG.network during SSR to avoid hydration mismatch
	// Only use the context network after mount
	const displayNetwork = mounted && network ? network : APP_CONFIG.network

	return (
		<Group justify="space-between" w="100%" wrap="nowrap" gap="xs" style={{ overflow: "hidden" }}>
			<Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
				<Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
					<Box style={{ width: 32, height: 32, flexShrink: 0 }}>
						<Image
							src="/eduChainLogo.png"
							alt="EduChain logo"
							width={32}
							height={32}
							priority
							style={{ width: "100%", height: "100%", objectFit: "contain" }}
						/>
					</Box>
					<Text fw={700} size="xs" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						EduCityChain
					</Text>
				</Group>
				<Badge variant="light" size="xs" visibleFrom="sm">
					{displayNetwork}
				</Badge>
			</Group>

			<Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
				{/* Desktop-only elements - mobile shows these in nav menu */}
				{mounted && account && (
					<Box visibleFrom="sm">
						<FaucetButton />
					</Box>
				)}

				{/* Render wallet UI only after mount to avoid SSR/client hydration mismatch */}
				{mounted ? (
					<Box visibleFrom="sm">
						<ConnectButton />
					</Box>
				) : null}

				{mounted && account?.address && (
					<Box visibleFrom="sm">
						<Menu width={260} position="bottom-end">
							<Menu.Target>
								<Badge variant="outline" size="xs" rightSection={<IconChevronDown size={12} />} style={{ cursor: "pointer" }}>
									{shortAddress(account.address)}
								</Badge>
							</Menu.Target>

							<Menu.Dropdown>
								<Menu.Label>Wallet</Menu.Label>
								<Menu.Item leftSection={<IconCopy size={16} />} onClick={onCopy}>
									Copy address
								</Menu.Item>
								<Menu.Item leftSection={<IconLogOut size={16} />} color="red" onClick={() => disconnect()}>
									Disconnect
								</Menu.Item>
							</Menu.Dropdown>
						</Menu>
					</Box>
				)}
			</Group>
		</Group>
	)
}
