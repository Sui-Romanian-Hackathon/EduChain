"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { AppShell, Box, Burger, Group, NavLink, ScrollArea, Stack, Divider, Badge, Menu, Text, Button, useMantineColorScheme } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconBookOpen, IconChevronDown, IconClipboard, IconCopy, IconLogOut, IconMoon, IconSettings, IconSun, IconUser } from "./icons/feather"
import { HeaderBar } from "./HeaderBar"
import { ConnectButton, useCurrentAccount, useDisconnectWallet, useSuiClientContext } from "@mysten/dapp-kit"
import { APP_CONFIG, shortAddress } from "@/lib/config"
import { notifications } from "@mantine/notifications"
import { FaucetButton } from "./FaucetButton"
import { useCaps } from "@/lib/useCaps"

export function AppShellLayout({
	active,
	children
}: {
	active: "courses" | "proposals" | "profile" | "admin"
	children: React.ReactNode
}) {
	const [opened, { toggle, close }] = useDisclosure(false)
	const account = useCurrentAccount()
	const { mutate: disconnect } = useDisconnectWallet()
	const { network } = useSuiClientContext()
	const [mounted, setMounted] = useState(false)
	const { caps } = useCaps()
	const isAdminWallet = Boolean(caps.adminCapId)
	const { colorScheme, toggleColorScheme } = useMantineColorScheme()

	useEffect(() => {
		setMounted(true)
	}, [])

	const onCopy = async () => {
		if (!account?.address) return
		await navigator.clipboard.writeText(account.address)
		notifications.show({ message: "Address copied" })
	}

	const displayNetwork = mounted && network ? network : APP_CONFIG.network

	return (
		<AppShell
			header={{ height: 64 }}
			navbar={{
				width: 280,
				breakpoint: "sm",
				collapsed: { mobile: !opened }
			}}
			padding="md"
		>
			<AppShell.Header>
				<Group h="100%" px="md" justify="space-between" wrap="nowrap" gap="xs">
					<Group wrap="nowrap">
						<Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
					</Group>
					<Box style={{ flex: 1, minWidth: 0 }}>
						<HeaderBar />
					</Box>
				</Group>
			</AppShell.Header>

			<AppShell.Navbar p="md">
				<ScrollArea h="100%" type="auto">
					<Stack gap="md" h="100%" justify="space-between">
						<Stack gap="md">
							{/* Mobile-only wallet section */}
							<Box hiddenFrom="sm">
								<Stack gap="sm">
									<Group justify="space-between">
										<Text size="sm" fw={600}>
											Network
										</Text>
										<Badge variant="light" size="sm">
											{displayNetwork}
										</Badge>
									</Group>

									{mounted && (
										<Box>
											<ConnectButton />
										</Box>
									)}

									{mounted && account && (
										<Box>
											<FaucetButton />
										</Box>
									)}

									{mounted && account?.address && (
										<Menu width={260} position="right-start">
											<Menu.Target>
												<Box
													style={{
														padding: "8px 12px",
														borderRadius: "4px",
														border: "1px solid var(--mantine-color-gray-4)",
														cursor: "pointer",
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center"
													}}
												>
													<Text size="sm" fw={500}>
														Wallet
													</Text>
													<Group gap="xs">
														<Badge variant="outline" size="sm">
															{shortAddress(account.address)}
														</Badge>
														<IconChevronDown size={14} />
													</Group>
												</Box>
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
									)}

									<Divider />
								</Stack>
							</Box>

							{/* Navigation links */}
							<NavLink
								component={Link}
								href="/dashboard?tab=courses"
								label="Courses"
								leftSection={<IconBookOpen size={18} />}
								active={active === "courses"}
								onClick={close}
							/>
							<NavLink
								component={Link}
								href="/dashboard?tab=proposals"
								label="Proposals"
								leftSection={<IconClipboard size={18} />}
								active={active === "proposals"}
								onClick={close}
							/>
							{account ? (
								<>
									<NavLink
										component={Link}
										href="/dashboard?tab=profile"
										label="Profile"
										leftSection={<IconUser size={18} />}
										active={active === "profile"}
										onClick={close}
									/>
									{isAdminWallet ? (
										<NavLink
											component={Link}
											href="/dashboard?tab=admin"
											label="Admin"
											leftSection={<IconSettings size={18} />}
											active={active === "admin"}
											onClick={close}
										/>
									) : null}
								</>
							) : null}
						</Stack>

						{/* Bottom menu actions */}
						<Stack gap="xs">
							<Divider />
							{mounted ? (
								<Button
									variant="light"
									fullWidth
									onClick={() => toggleColorScheme()}
									leftSection={colorScheme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
								>
									{colorScheme === "dark" ? "Light mode" : "Dark mode"}
								</Button>
							) : null}
						</Stack>
					</Stack>
				</ScrollArea>
			</AppShell.Navbar>

			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	)
}
