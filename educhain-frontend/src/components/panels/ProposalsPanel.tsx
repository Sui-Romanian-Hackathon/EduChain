"use client"

import { useEffect, useMemo, useState } from "react"
import {
	Card,
	Text,
	Title,
	SimpleGrid,
	Button,
	Group,
	Stack,
	Skeleton,
	Badge,
	Progress,
	TextInput,
	ThemeIcon,
	Divider,
	Tooltip
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit"
import { useQueryClient } from "@tanstack/react-query"
import { useProposals } from "@/lib/useProposals"
import { useProfile } from "@/lib/useProfile"
import { useVotes } from "@/lib/useVotes"
import { APP_CONFIG, suiChainId } from "@/lib/config"
import { buildCreateProfileTx, buildVoteTx } from "@/lib/sui"
import { IconClipboard, IconPlusCircle, IconSearch, IconThumbsDown, IconThumbsUp } from "@/components/icons/feather"
import { refreshAfterTx } from "@/lib/refreshAfterTx"

export function ProposalsPanel() {
	const client = useSuiClient()
	const queryClient = useQueryClient()
	const account = useCurrentAccount()
	const { profile } = useProfile()
	const { proposals, loading, source } = useProposals(50)
	const { votedProposalIds, refetch: refetchVotes } = useVotes(500)

	const { mutate: signAndExecuteTransaction, isPending: txPending } = useSignAndExecuteTransaction()
	const [filter, setFilter] = useState("")
	const [optimisticVoted, setOptimisticVoted] = useState<Set<number>>(new Set())

	useEffect(() => {
		// Reset optimistic state when wallet changes
		setOptimisticVoted(new Set())
	}, [account?.address])

	const filtered = useMemo(() => {
		const q = filter.trim().toLowerCase()
		if (!q) return proposals
		return proposals.filter((p) => (p.title ?? "").toLowerCase().includes(q))
	}, [proposals, filter])

	const totalProposals = proposals.length
	const votedCount = votedProposalIds.size

	const requireWallet = () => {
		if (!account) {
			notifications.show({
				color: "blue",
				title: "Wallet required",
				message: "Please connect your wallet to perform this action."
			})
			return false
		}
		return true
	}

	const onCreateProfile = async () => {
		if (!requireWallet()) return
		try {
			const tx = await buildCreateProfileTx(client as any)
			signAndExecuteTransaction(
				{ transaction: tx as any, chain: suiChainId(APP_CONFIG.network) },
				{
					onSuccess: (res) => {
						notifications.show({ title: "Profile created", message: `Tx: ${res.digest}` })
						void refreshAfterTx({ client: client as any, queryClient, digest: res.digest })
					},
					onError: (e) => notifications.show({ color: "red", title: "Transaction failed", message: e.message })
				}
			)
		} catch (e: any) {
			notifications.show({ color: "red", title: "Error", message: e.message ?? "Unknown error" })
		}
	}

	const onVote = async (proposalId: number, choice: 0 | 1) => {
		if (!requireWallet()) return
		if (!profile) {
			notifications.show({ color: "yellow", title: "No Profile", message: "Create your Profile first." })
			return
		}
		try {
			const tx = await buildVoteTx(client as any, { profileId: profile.objectId, proposalId, choice })
			signAndExecuteTransaction(
				{ transaction: tx as any, chain: suiChainId(APP_CONFIG.network) },
				{
					onSuccess: (res) => {
						setOptimisticVoted((prev) => {
							const next = new Set(prev)
							next.add(proposalId)
							return next
						})
						// Best-effort refresh VoteCast events so UI stays consistent after navigation.
						refetchVotes()
						notifications.show({ title: "Vote submitted", message: `Tx: ${res.digest}` })
						void refreshAfterTx({ client: client as any, queryClient, digest: res.digest })
					},
					onError: (e) => notifications.show({ color: "red", title: "Transaction failed", message: e.message })
				}
			)
		} catch (e: any) {
			notifications.show({ color: "red", title: "Error", message: e.message ?? "Unknown error" })
		}
	}

	return (
		<Stack gap="md">
			<Stack gap="md">
				<Stack gap={0}>
					<Group gap="xs" align="center">
						<IconClipboard size={20} />
						<Title order={2}>Proposals</Title>
					</Group>
					<Text size="sm" c="dimmed">
						Vote on on-chain proposals (writes to shared registry + your owned Profile).
					</Text>
				</Stack>

				<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
					<Card withBorder radius="lg" p="md">
						<Group justify="space-between">
							<Stack gap={2}>
								<Text c="dimmed" size="sm">
									Proposals
								</Text>
								<Title order={3}>{totalProposals}</Title>
							</Stack>
							<ThemeIcon variant="light" radius="xl" size={34}>
								<IconClipboard size={18} />
							</ThemeIcon>
						</Group>
					</Card>
					<Card withBorder radius="lg" p="md">
						<Group justify="space-between">
							<Stack gap={2}>
								<Text c="dimmed" size="sm">
									Votes cast
								</Text>
								<Title order={3}>{votedCount}</Title>
							</Stack>
							<ThemeIcon variant="light" radius="xl" size={34}>
								<IconThumbsUp size={18} />
							</ThemeIcon>
						</Group>
					</Card>
					<Card withBorder radius="lg" p="md">
						<Group justify="space-between">
							<Stack gap={2}>
								<Text c="dimmed" size="sm">
									Participation
								</Text>
								<Badge variant="light" color={totalProposals ? "blue" : "gray"}>
									{totalProposals ? `${Math.round((votedCount / Math.max(1, totalProposals)) * 100)}%` : "—"}
								</Badge>
							</Stack>
							<ThemeIcon variant="light" radius="xl" size={34}>
								<IconThumbsUp size={18} />
							</ThemeIcon>
						</Group>
					</Card>
					<Card withBorder radius="lg" p="md">
						<Group justify="space-between">
							<Stack gap={2}>
								<Text c="dimmed" size="sm">
									Status
								</Text>
								<Badge variant="light" color={profile ? "green" : "yellow"}>
									{profile ? "Ready to vote" : "Create Profile to vote"}
								</Badge>
							</Stack>
							<ThemeIcon variant="light" radius="xl" size={34}>
								<IconPlusCircle size={18} />
							</ThemeIcon>
						</Group>
					</Card>
				</SimpleGrid>

				{!profile && (
					<Group>
						<Tooltip label="Connect your wallet" disabled={!!account} withArrow>
							<Button onClick={onCreateProfile} loading={txPending} visibleFrom="sm" leftSection={<IconPlusCircle size={16} />}>
								Create Profile
							</Button>
						</Tooltip>
						<Tooltip label="Connect your wallet" disabled={!!account} withArrow>
							<Button
								onClick={onCreateProfile}
								loading={txPending}
								fullWidth
								hiddenFrom="sm"
								leftSection={<IconPlusCircle size={16} />}
							>
								Create Profile
							</Button>
						</Tooltip>
					</Group>
				)}
			</Stack>

			<TextInput
				placeholder="Search proposals…"
				value={filter}
				onChange={(e) => setFilter(e.currentTarget.value)}
				leftSection={<IconSearch size={16} />}
			/>

			{!loading && totalProposals === 0 ? (
				<Card withBorder radius="lg" p="lg">
					<Group gap="xs" wrap="nowrap">
						<ThemeIcon variant="light" radius="xl" size={36}>
							<IconClipboard size={18} />
						</ThemeIcon>
						<Stack gap={0}>
							<Text fw={700}>No proposals yet</Text>
							<Text size="sm" c="dimmed">
								Once an admin creates proposals (Admin → Create proposal), they’ll show up here.
							</Text>
						</Stack>
					</Group>
				</Card>
			) : null}

			{loading ? (
				<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
					{Array.from({ length: 6 }).map((_, i) => (
						<Card key={i} withBorder radius="lg" p="lg">
							<Skeleton height={18} width="70%" mb="sm" />
							<Skeleton height={12} width="90%" mb="xs" />
							<Skeleton height={12} width="60%" mb="md" />
							<Skeleton height={32} />
						</Card>
					))}
				</SimpleGrid>
			) : filtered.length === 0 ? (
				<Card withBorder radius="lg" p="lg">
					<Group justify="space-between" align="flex-start" wrap="nowrap">
						<Group gap="xs" wrap="nowrap">
							<ThemeIcon variant="light" radius="xl" size={36}>
								<IconSearch size={18} />
							</ThemeIcon>
							<Stack gap={0}>
								<Text fw={700}>No matches</Text>
								<Text size="sm" c="dimmed">
									No proposals match “{filter.trim()}”. Try a different search.
								</Text>
							</Stack>
						</Group>
						<Button variant="light" size="xs" onClick={() => setFilter("")} style={{ flexShrink: 0 }}>
							Clear
						</Button>
					</Group>
				</Card>
			) : (
				<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
					{filtered.map((p) => {
						const voted = votedProposalIds.has(p.id) || optimisticVoted.has(p.id)
						const yes = p.yesVotes ?? 0
						const no = p.noVotes ?? 0
						const total = Math.max(1, yes + no)
						const yesPct = Math.round((yes / total) * 100)

						return (
							<Card key={p.objectId} withBorder radius="lg" p="lg">
								<Stack gap="xs">
									<Group justify="space-between" align="flex-start">
										<Group gap="xs" align="center" style={{ minWidth: 0 }}>
											<IconClipboard size={16} />
											<Title order={4} style={{ minWidth: 0 }}>
												{p.title ?? `Proposal #${p.id}`}
											</Title>
										</Group>
										<Badge variant="light">#{p.id}</Badge>
									</Group>

									{p.description && (
										<Text size="sm" c="dimmed" lineClamp={3}>
											{p.description}
										</Text>
									)}

									<Divider />

									<Group justify="space-between" mt="xs">
										<Text size="sm" c="dimmed">
											Votes
										</Text>
										<Badge color={voted ? "green" : "gray"} variant="light">
											{voted ? "Voted" : "Not voted"}
										</Badge>
									</Group>

									<Progress value={yesPct} mt="xs" />

									<Group justify="space-between" mt="sm">
										<Text size="xs" c="dimmed">
											Yes {yes} / No {no}
										</Text>
										<Group gap="xs">
											<Tooltip
												label={!account ? "Connect your wallet" : !profile ? "Create your profile first" : ""}
												disabled={!!account && !!profile}
												withArrow
											>
												<Button
													size="xs"
													variant="light"
													disabled={voted}
													loading={txPending}
													onClick={() => onVote(p.id, 0)}
													leftSection={<IconThumbsDown size={14} />}
												>
													No
												</Button>
											</Tooltip>
											<Tooltip
												label={!account ? "Connect your wallet" : !profile ? "Create your profile first" : ""}
												disabled={!!account && !!profile}
												withArrow
											>
												<Button
													size="xs"
													disabled={voted}
													loading={txPending}
													onClick={() => onVote(p.id, 1)}
													leftSection={<IconThumbsUp size={14} />}
												>
													Yes
												</Button>
											</Tooltip>
										</Group>
									</Group>
								</Stack>
							</Card>
						)
					})}
				</SimpleGrid>
			)}

			<Text size="xs" c="dimmed">
				Using chain: sui:{APP_CONFIG.network} (data source: {source})
			</Text>
		</Stack>
	)
}
