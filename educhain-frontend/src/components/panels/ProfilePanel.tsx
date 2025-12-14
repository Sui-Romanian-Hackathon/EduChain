"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
	Card,
	Text,
	Title,
	Group,
	Stack,
	Button,
	SimpleGrid,
	Code,
	Divider,
	Anchor,
	Tabs,
	ThemeIcon,
	ActionIcon,
	Badge,
	List,
	Tooltip,
	Modal,
	Box
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit"
import { useQueryClient } from "@tanstack/react-query"
import { useProfile } from "@/lib/useProfile"
import { useEnrollments } from "@/lib/useEnrollments"
import { useCourses } from "@/lib/useCourses"
import { useResults } from "@/lib/useResults"
import { useCertificates } from "@/lib/useCertificates"
import { useVotes } from "@/lib/useVotes"
import { useProposals } from "@/lib/useProposals"
import { APP_CONFIG, shortAddress, suiChainId } from "@/lib/config"
import { buildCreateProfileTx } from "@/lib/sui"
import {
	IconArrowRight,
	IconAward,
	IconBookOpen,
	IconCheckCircle,
	IconClipboard,
	IconCopy,
	IconFileText,
	IconPlusCircle,
	IconRefreshCw,
	IconThumbsUp,
	IconUser
} from "@/components/icons/feather"
import { refreshAfterTx } from "@/lib/refreshAfterTx"
import { ClipLoader } from "react-spinners"

type ProfileSubTab = "overview" | "learning" | "certificates" | "civic" | "debug"

export function ProfilePanel() {
	const client = useSuiClient()
	const queryClient = useQueryClient()
	const account = useCurrentAccount()
	const router = useRouter()
	const searchParams = useSearchParams()
	const { profile, refetch, isPending } = useProfile()
	const { enrollments } = useEnrollments(200)
	const { completedCourseIds, resultByCourseId } = useResults(500)
	const { courses } = useCourses(200)
	const { certificates } = useCertificates(50)
	const { votedProposalIds, votedChoiceByProposalId } = useVotes(500)
	const { proposals } = useProposals(200)
	const { mutate: signAndExecuteTransaction, isPending: txPending } = useSignAndExecuteTransaction()
	const [learningSnapshotExpanded, setLearningSnapshotExpanded] = useState(false)
	const [metadataModalOpened, setMetadataModalOpened] = useState(false)
	const [metadataLoading, setMetadataLoading] = useState(false)
	const [certificateMetadata, setCertificateMetadata] = useState<{
		name: string
		description: string
		external_url: string
		attributes: Array<{ trait_type: string; value: string | null }>
	} | null>(null)
	const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null)

	const refreshAll = async () => {
		await refetch()
		await refreshAfterTx({ client: client as any, queryClient })
	}

	const subTab: ProfileSubTab = useMemo(() => {
		const s = (searchParams.get("sub") ?? "overview") as ProfileSubTab
		if (s === "overview" || s === "learning" || s === "certificates" || s === "civic" || s === "debug") return s
		return "overview"
	}, [searchParams])

	const setSubTab = (next: ProfileSubTab) => {
		const sp = new URLSearchParams(searchParams.toString())
		sp.set("tab", "profile")
		sp.set("sub", next)
		router.replace(`/dashboard?${sp.toString()}`)
	}

	const onCreateProfile = async () => {
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

	const onCopyAddress = async () => {
		if (!account?.address) return
		await navigator.clipboard.writeText(account.address)
		notifications.show({ message: "Address copied" })
	}

	const onShowMetadata = async (certificateId: string) => {
		setSelectedCertificateId(certificateId)
		setMetadataModalOpened(true)
		setMetadataLoading(true)
		setCertificateMetadata(null)

		try {
			const response = await fetch(`/api/certificates/${certificateId}`)
			if (!response.ok) {
				throw new Error("Failed to fetch certificate metadata")
			}
			const data = await response.json()
			setCertificateMetadata(data)
		} catch (error: any) {
			notifications.show({ color: "red", title: "Error", message: error?.message ?? "Failed to load metadata" })
			setMetadataModalOpened(false)
		} finally {
			setMetadataLoading(false)
		}
	}

	const enrolledCoursesLabel = useMemo(() => {
		if (!enrollments.length) return "—"
		return enrollments
			.map((e) => {
				const course = courses.find((c) => c.id === e.courseId)
				const done = completedCourseIds.has(e.courseId)
				const score = done ? resultByCourseId.get(e.courseId)?.score : undefined
				const suffix = done ? ` ✅${score != null ? ` (${score})` : ""}` : ""
				return course?.title ? `${course.title} (#${e.courseId})${suffix}` : `#${e.courseId}${suffix}`
			})
			.join(", ")
	}, [completedCourseIds, courses, enrollments, resultByCourseId])

	const completedCoursesLabel = useMemo(() => {
		const completed = enrollments.filter((e) => completedCourseIds.has(e.courseId))
		if (!completed.length) return "—"
		return completed
			.map((e) => {
				const course = courses.find((c) => c.id === e.courseId)
				const score = resultByCourseId.get(e.courseId)?.score
				const scoreLabel = score != null ? ` — score ${score}` : ""
				return course?.title ? `${course.title} (#${e.courseId})${scoreLabel}` : `#${e.courseId}${scoreLabel}`
			})
			.join(", ")
	}, [completedCourseIds, courses, enrollments, resultByCourseId])

	const votedProposalsLabel = useMemo(() => {
		if (!votedProposalIds.size) return "—"
		return [...votedProposalIds]
			.sort((a, b) => a - b)
			.map((id) => {
				const title = proposals.find((p) => p.id === id)?.title ?? `#${id}`
				const choice = votedChoiceByProposalId.get(id)
				const choiceLabel = choice === 0 ? "No" : "Yes"
				return `${title} (${choiceLabel})`
			})
			.join(", ")
	}, [proposals, votedChoiceByProposalId, votedProposalIds])

	const enrollmentRows = useMemo(() => {
		return enrollments
			.map((e) => {
				const course = courses.find((c) => c.id === e.courseId)
				const done = completedCourseIds.has(e.courseId)
				const score = done ? resultByCourseId.get(e.courseId)?.score : undefined
				return {
					courseId: e.courseId,
					title: course?.title ?? `Course #${e.courseId}`,
					done,
					score
				}
			})
			.sort((a, b) => Number(b.done) - Number(a.done) || b.courseId - a.courseId)
	}, [completedCourseIds, courses, enrollments, resultByCourseId])

	const inProgressEnrollmentCount = useMemo(() => {
		return enrollments.filter((e) => !completedCourseIds.has(e.courseId)).length
	}, [completedCourseIds, enrollments])

	const voteRows = useMemo(() => {
		return [...votedProposalIds]
			.sort((a, b) => b - a)
			.map((id) => {
				const proposal = proposals.find((p) => p.id === id)
				const choice = votedChoiceByProposalId.get(id) ?? 1
				return {
					proposalId: id,
					title: proposal?.title ?? `Proposal #${id}`,
					choice
				}
			})
	}, [proposals, votedChoiceByProposalId, votedProposalIds])

	return (
		<Stack gap="md">
			<Stack gap="md">
				<Stack gap={0}>
					<Group gap="xs" align="center">
						<IconUser size={20} />
						<Title order={2}>Profile</Title>
					</Group>
					<Text size="sm" c="dimmed">
						Owned object that tracks your learning + civic achievements.
					</Text>
				</Stack>

				<Group visibleFrom="sm">
					<Button
						variant="light"
						onClick={refreshAll}
						loading={isPending}
						disabled={!account}
						leftSection={<IconRefreshCw size={16} />}
					>
						Refresh
					</Button>
					{!profile && (
						<Button onClick={onCreateProfile} loading={txPending} disabled={!account} leftSection={<IconPlusCircle size={16} />}>
							Create Profile
						</Button>
					)}
				</Group>
				<Stack gap="xs" hiddenFrom="sm">
					<Button
						variant="light"
						onClick={refreshAll}
						loading={isPending}
						disabled={!account}
						fullWidth
						leftSection={<IconRefreshCw size={16} />}
					>
						Refresh
					</Button>
					{!profile && (
						<Button
							onClick={onCreateProfile}
							loading={txPending}
							disabled={!account}
							fullWidth
							leftSection={<IconPlusCircle size={16} />}
						>
							Create Profile
						</Button>
					)}
				</Stack>
			</Stack>

			<Tabs value={subTab} onChange={(v) => v && setSubTab(v as ProfileSubTab)} keepMounted={false}>
				<Box
					style={{
						overflowX: "auto",
						overflowY: "hidden",
						WebkitOverflowScrolling: "touch",
						scrollbarWidth: "thin"
					}}
				>
					<Tabs.List style={{ flexWrap: "nowrap", minWidth: "max-content" }}>
						<Tabs.Tab value="overview" style={{ flexShrink: 0 }}>
							<Group gap={6}>
								<IconUser size={14} />
								<Text size="sm">Overview</Text>
							</Group>
						</Tabs.Tab>
						<Tabs.Tab value="learning" style={{ flexShrink: 0 }}>
							<Group gap={6}>
								<IconBookOpen size={14} />
								<Text size="sm">Learning</Text>
							</Group>
						</Tabs.Tab>
						<Tabs.Tab value="certificates" style={{ flexShrink: 0 }}>
							<Group gap={6}>
								<IconFileText size={14} />
								<Text size="sm">Certificates</Text>
							</Group>
						</Tabs.Tab>
						<Tabs.Tab value="civic" style={{ flexShrink: 0 }}>
							<Group gap={6}>
								<IconThumbsUp size={14} />
								<Text size="sm">Civic</Text>
							</Group>
						</Tabs.Tab>
						<Tabs.Tab value="debug" style={{ flexShrink: 0 }}>
							<Group gap={6}>
								<IconClipboard size={14} />
								<Text size="sm">Debug</Text>
							</Group>
						</Tabs.Tab>
					</Tabs.List>
				</Box>

				<Tabs.Panel value="overview" pt="md">
					<Card withBorder radius="lg" p="lg">
						<Stack gap="sm">
							<Group justify="space-between" align="flex-start" wrap="nowrap">
								<Stack gap={2} style={{ minWidth: 0 }}>
									<Group gap="xs" wrap="nowrap">
										<ThemeIcon variant="light" radius="xl" size={32} color="blue">
											<IconUser size={18} />
										</ThemeIcon>
										<Stack gap={0} style={{ minWidth: 0 }}>
											<Group gap="xs" wrap="wrap">
												<Text fw={700}>Welcome</Text>
												<Badge variant="light" color={account ? "blue" : "gray"}>
													{account ? "Wallet connected" : "Not connected"}
												</Badge>
												<Badge variant="light" color={profile ? "green" : "yellow"}>
													{profile ? "Profile active" : "Profile not created"}
												</Badge>
											</Group>
											<Text size="sm" c="dimmed" lineClamp={2}>
												{account?.address
													? `Connected as ${shortAddress(account.address)} on sui:${APP_CONFIG.network}.`
													: "Connect your wallet to get started."}
											</Text>
										</Stack>
									</Group>
								</Stack>

								<Group gap="xs" style={{ flexShrink: 0 }}>
									{account?.address ? (
										<Tooltip label="Copy address" withArrow>
											<ActionIcon variant="light" onClick={onCopyAddress} aria-label="Copy address">
												<IconCopy size={16} />
											</ActionIcon>
										</Tooltip>
									) : null}
								</Group>
							</Group>

							<Divider />

							{isPending && !profile ? (
								<Stack gap="md" align="center" py="xl">
									<ClipLoader color="var(--mantine-color-blue-6)" size={40} />
									<Text c="dimmed" size="sm">
										Loading profile...
									</Text>
								</Stack>
							) : !profile ? (
								<Stack gap="sm">
									<Text c="dimmed" size="sm">
										Your on-chain Profile is where we track learning and civic achievements.
									</Text>
									<Card withBorder radius="md" p="md">
										<Group justify="space-between" align="flex-start" wrap="nowrap">
											<Stack gap={6} style={{ minWidth: 0 }}>
												<Text fw={600}>Quick start</Text>
												<List
													size="sm"
													spacing={6}
													icon={
														<ThemeIcon size={18} radius="xl" variant="light" color="blue">
															<IconArrowRight size={12} />
														</ThemeIcon>
													}
												>
													<List.Item>Create your Profile</List.Item>
													<List.Item>Enroll in a course and complete it</List.Item>
													<List.Item>Earn a certificate and vote on proposals</List.Item>
												</List>
											</Stack>
											<ThemeIcon variant="light" radius="xl" size={36} style={{ flexShrink: 0 }} color="green">
												<IconPlusCircle size={18} />
											</ThemeIcon>
										</Group>
									</Card>
								</Stack>
							) : (
								<Stack gap="md">
									<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
										<Card withBorder radius="lg" p="md">
											<Group justify="space-between" align="flex-start">
												<Stack gap={2}>
													<Text c="dimmed" size="sm">
														Education points
													</Text>
													<Title order={3}>{profile.eduPoints}</Title>
												</Stack>
												<ThemeIcon variant="light" radius="xl" size={34} color="yellow">
													<IconAward size={18} />
												</ThemeIcon>
											</Group>
										</Card>

										<Card withBorder radius="lg" p="md">
											<Group justify="space-between" align="flex-start">
												<Stack gap={2}>
													<Text c="dimmed" size="sm">
														Civic points
													</Text>
													<Title order={3}>{profile.civicPoints}</Title>
												</Stack>
												<ThemeIcon variant="light" radius="xl" size={34} color="violet">
													<IconThumbsUp size={18} />
												</ThemeIcon>
											</Group>
										</Card>

										<Card withBorder radius="lg" p="md">
											<Group justify="space-between" align="flex-start">
												<Stack gap={2}>
													<Text c="dimmed" size="sm">
														Certificates
													</Text>
													<Title order={3}>{certificates.length}</Title>
												</Stack>
												<ThemeIcon variant="light" radius="xl" size={34} color="cyan">
													<IconFileText size={18} />
												</ThemeIcon>
											</Group>
										</Card>

										<Card withBorder radius="lg" p="md">
											<Group justify="space-between" align="flex-start">
												<Stack gap={2}>
													<Text c="dimmed" size="sm">
														Completed courses
													</Text>
													<Title order={3}>{completedCourseIds.size}</Title>
												</Stack>
												<ThemeIcon variant="light" radius="xl" size={34} color="green">
													<IconCheckCircle size={18} />
												</ThemeIcon>
											</Group>
										</Card>
									</SimpleGrid>

									<SimpleGrid cols={{ base: 1, md: 2 }}>
										<Card withBorder radius="lg" p="lg">
											<Group justify="space-between" align="flex-start" wrap="nowrap">
												<Stack gap="sm" style={{ minWidth: 0, flex: 1 }}>
													<Group gap="xs">
														<ThemeIcon variant="light" radius="xl" size={20} color="blue">
															<IconBookOpen size={12} />
														</ThemeIcon>
														<Text fw={600}>Learning snapshot</Text>
													</Group>
													{enrollments.length === 0 ? (
														<Text size="sm" c="dimmed">
															No enrolled courses yet
														</Text>
													) : (
														<Stack gap="xs">
															{(learningSnapshotExpanded ? enrollments : enrollments.slice(0, 3)).map((e) => {
																const course = courses.find((c) => c.id === e.courseId)
																const done = completedCourseIds.has(e.courseId)
																const score = done ? resultByCourseId.get(e.courseId)?.score : undefined
																return (
																	<Group key={e.courseId} gap="xs" wrap="nowrap" align="center">
																		<ThemeIcon variant="light" radius="xl" size={24} color={done ? "green" : "blue"}>
																			{done ? <IconCheckCircle size={12} /> : <IconBookOpen size={12} />}
																		</ThemeIcon>
																		<Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
																			<Text size="sm" fw={500} lineClamp={1}>
																				{course?.title ?? `Course #${e.courseId}`}
																			</Text>
																			<Group gap="xs">
																				<Badge variant="light" size="xs" color={done ? "green" : "blue"}>
																					{done ? "Completed" : "In progress"}
																				</Badge>
																				{score != null && (
																					<Badge variant="light" size="xs" color="green">
																						Score: {score}
																					</Badge>
																				)}
																			</Group>
																		</Stack>
																	</Group>
																)
															})}
															{enrollments.length > 3 && (
																<Text
																	size="xs"
																	c="blue"
																	style={{ cursor: "pointer" }}
																	onClick={() => setLearningSnapshotExpanded(!learningSnapshotExpanded)}
																	underline
																>
																	{learningSnapshotExpanded
																		? "Show less"
																		: `+${enrollments.length - 3} more course${enrollments.length - 3 !== 1 ? "s" : ""}`}
																</Text>
															)}
														</Stack>
													)}
													<Button
														variant="light"
														size="xs"
														leftSection={<IconBookOpen size={14} />}
														rightSection={<IconArrowRight size={14} />}
														onClick={() => setSubTab("learning")}
														style={{ alignSelf: "flex-start" }}
													>
														View learning
													</Button>
												</Stack>
												<ThemeIcon variant="light" radius="xl" size={36} style={{ flexShrink: 0 }} color="blue">
													<IconBookOpen size={18} />
												</ThemeIcon>
											</Group>
										</Card>

										<Card withBorder radius="lg" p="lg">
											<Group justify="space-between" align="flex-start" wrap="nowrap">
												<Stack gap={6} style={{ minWidth: 0 }}>
													<Group gap="xs">
														<ThemeIcon variant="light" radius="xl" size={20} color="violet">
															<IconClipboard size={12} />
														</ThemeIcon>
														<Text fw={600}>Civic snapshot</Text>
													</Group>
													<Text size="sm" c="dimmed" lineClamp={3}>
														{votedProposalsLabel}
													</Text>
													<Button
														variant="light"
														size="xs"
														leftSection={<IconClipboard size={14} />}
														rightSection={<IconArrowRight size={14} />}
														onClick={() => setSubTab("civic")}
														style={{ alignSelf: "flex-start" }}
													>
														View civic
													</Button>
												</Stack>
												<ThemeIcon variant="light" radius="xl" size={36} style={{ flexShrink: 0 }} color="violet">
													<IconThumbsUp size={18} />
												</ThemeIcon>
											</Group>
										</Card>
									</SimpleGrid>
								</Stack>
							)}
						</Stack>
					</Card>
				</Tabs.Panel>

				<Tabs.Panel value="learning" pt="md">
					{!profile ? (
						<Card withBorder radius="lg" p="lg">
							<Group justify="space-between" align="flex-start" wrap="nowrap">
								<Stack gap={6}>
									<Group gap="xs">
										<ThemeIcon variant="light" radius="xl" size={36} color="blue">
											<IconBookOpen size={18} />
										</ThemeIcon>
										<Stack gap={0}>
											<Text fw={700}>Learning</Text>
											<Text c="dimmed" size="sm">
												Create your Profile to track enrollments, completions, and scores.
											</Text>
										</Stack>
									</Group>
								</Stack>
								<ThemeIcon variant="light" radius="xl" size={36} style={{ flexShrink: 0 }} color="blue">
									<IconPlusCircle size={18} />
								</ThemeIcon>
							</Group>
						</Card>
					) : (
						<Stack gap="md">
							<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
								<Card withBorder radius="lg" p="md">
									<Group justify="space-between">
										<Stack gap={2}>
											<Text c="dimmed" size="sm">
												Enrolled (in progress)
											</Text>
											<Title order={3}>{inProgressEnrollmentCount}</Title>
										</Stack>
										<ThemeIcon variant="light" radius="xl" size={34} color="blue">
											<IconBookOpen size={18} />
										</ThemeIcon>
									</Group>
								</Card>

								<Card withBorder radius="lg" p="md">
									<Group justify="space-between">
										<Stack gap={2}>
											<Text c="dimmed" size="sm">
												Completed
											</Text>
											<Title order={3}>{completedCourseIds.size}</Title>
										</Stack>
										<ThemeIcon variant="light" radius="xl" size={34} color="green">
											<IconCheckCircle size={18} />
										</ThemeIcon>
									</Group>
								</Card>

								<Card withBorder radius="lg" p="md">
									<Group justify="space-between">
										<Stack gap={2}>
											<Text c="dimmed" size="sm">
												Education points
											</Text>
											<Title order={3}>{profile.eduPoints}</Title>
										</Stack>
										<ThemeIcon variant="light" radius="xl" size={34} color="yellow">
											<IconAward size={18} />
										</ThemeIcon>
									</Group>
								</Card>

								<Card withBorder radius="lg" p="md">
									<Group justify="space-between">
										<Stack gap={2}>
											<Text c="dimmed" size="sm">
												Latest status
											</Text>
											<Badge variant="light" color={enrollments.length ? "blue" : "gray"}>
												{enrollments.length ? "Active learner" : "No enrollments yet"}
											</Badge>
										</Stack>
										<ThemeIcon variant="light" radius="xl" size={34} color="blue">
											<IconBookOpen size={18} />
										</ThemeIcon>
									</Group>
								</Card>
							</SimpleGrid>

							<Card withBorder radius="lg" p="lg">
								<Group justify="space-between" align="flex-start">
									<Group gap="xs">
										<ThemeIcon variant="light" radius="xl" size={20} color="blue">
											<IconBookOpen size={12} />
										</ThemeIcon>
										<Text fw={700}>Your courses</Text>
									</Group>
									<Badge variant="light">{inProgressEnrollmentCount} in progress</Badge>
								</Group>

								<Divider my="sm" />

								{enrollmentRows.length ? (
									<Stack gap={10}>
										{enrollmentRows.map((r) => (
											<Card key={r.courseId} withBorder radius="md" p="md">
												<Group justify="space-between" align="flex-start" wrap="nowrap">
													<Stack gap={2} style={{ minWidth: 0 }}>
														<Text fw={600} size="sm" lineClamp={1}>
															{r.title}
														</Text>
														<Text size="xs" c="dimmed">
															Course #{r.courseId}
															{r.done && r.score != null ? ` • score ${r.score}` : ""}
														</Text>
													</Stack>
													<Badge variant="light" color={r.done ? "green" : "gray"} style={{ flexShrink: 0 }}>
														{r.done ? "Completed" : "Enrolled"}
													</Badge>
												</Group>
											</Card>
										))}
									</Stack>
								) : (
									<Text size="sm" c="dimmed">
										No enrollments yet. Head to the Courses tab to enroll.
									</Text>
								)}
							</Card>
						</Stack>
					)}
				</Tabs.Panel>

				<Tabs.Panel value="certificates" pt="md">
					{!profile ? (
						<Card withBorder radius="lg" p="lg">
							<Group justify="space-between" align="flex-start" wrap="nowrap">
								<Group gap="xs">
									<ThemeIcon variant="light" radius="xl" size={36} color="cyan">
										<IconFileText size={18} />
									</ThemeIcon>
									<Stack gap={0}>
										<Text fw={700}>Certificates</Text>
										<Text c="dimmed" size="sm">
											Earn certificates by completing courses.
										</Text>
									</Stack>
								</Group>
								<ThemeIcon variant="light" radius="xl" size={36} style={{ flexShrink: 0 }} color="green">
									<IconPlusCircle size={18} />
								</ThemeIcon>
							</Group>
						</Card>
					) : (
						<Stack gap="md">
							<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
								<Card withBorder radius="lg" p="md">
									<Group justify="space-between">
										<Stack gap={2}>
											<Text c="dimmed" size="sm">
												Certificates
											</Text>
											<Title order={3}>{certificates.length}</Title>
										</Stack>
										<ThemeIcon variant="light" radius="xl" size={34} color="cyan">
											<IconFileText size={18} />
										</ThemeIcon>
									</Group>
								</Card>

								<Card withBorder radius="lg" p="md">
									<Group justify="space-between">
										<Stack gap={2}>
											<Text c="dimmed" size="sm">
												Completed courses
											</Text>
											<Title order={3}>{completedCourseIds.size}</Title>
										</Stack>
										<ThemeIcon variant="light" radius="xl" size={34} color="green">
											<IconCheckCircle size={18} />
										</ThemeIcon>
									</Group>
								</Card>

								<Card withBorder radius="lg" p="md">
									<Group justify="space-between">
										<Stack gap={2}>
											<Text c="dimmed" size="sm">
												Best score
											</Text>
											<Title order={3}>{certificates.length ? Math.max(...certificates.map((c) => c.score)) : 0}</Title>
										</Stack>
										<ThemeIcon variant="light" radius="xl" size={34} color="yellow">
											<IconAward size={18} />
										</ThemeIcon>
									</Group>
								</Card>

								<Card withBorder radius="lg" p="md">
									<Group justify="space-between">
										<Stack gap={2}>
											<Text c="dimmed" size="sm">
												Status
											</Text>
											<Badge variant="light" color={certificates.length ? "green" : "gray"}>
												{certificates.length ? "Credentials earned" : "No certificates yet"}
											</Badge>
										</Stack>
										<ThemeIcon variant="light" radius="xl" size={34} color="cyan">
											<IconFileText size={18} />
										</ThemeIcon>
									</Group>
								</Card>
							</SimpleGrid>

							<Card withBorder radius="lg" p="lg">
								<Group justify="space-between" align="flex-start">
									<Group gap="xs">
										<ThemeIcon variant="light" radius="xl" size={20} color="cyan">
											<IconFileText size={12} />
										</ThemeIcon>
										<Text fw={700}>Your certificates</Text>
									</Group>
									<Badge variant="light">{certificates.length} owned</Badge>
								</Group>
								<Divider my="sm" />

								{certificates.length ? (
									<Stack gap={10}>
										{certificates.map((c) => {
											const course = courses.find((x) => x.id === c.courseId)
											return (
												<Card key={c.objectId} withBorder radius="md" p="md">
													<Group justify="space-between" align="flex-start" wrap="nowrap">
														<Group gap="sm" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
															<ThemeIcon variant="light" radius="xl" size={34} style={{ flexShrink: 0 }} color="yellow">
																<IconAward size={18} />
															</ThemeIcon>
															<Stack gap={2} style={{ minWidth: 0 }}>
																<Text size="sm" fw={600} lineClamp={1}>
																	{course?.title ? `${course.title} (#${c.courseId})` : `Course #${c.courseId}`}
																</Text>
																<Text size="xs" c="dimmed" lineClamp={1}>
																	Score: <b>{c.score}</b> • Object: <Code>{c.objectId}</Code>
																</Text>
															</Stack>
														</Group>
														<Stack gap={6} align="flex-end" style={{ flexShrink: 0 }}>
															<Button
																variant="subtle"
																size="xs"
																leftSection={<IconClipboard size={14} />}
																onClick={() => onShowMetadata(c.objectId)}
															>
																Hosted metadata
															</Button>
															{c.metadataUri ? (
																<Anchor href={c.metadataUri} target="_blank" rel="noreferrer" size="xs" c="dimmed">
																	<Group gap={6} wrap="nowrap">
																		<IconArrowRight size={14} />
																		<span>On-chain URI</span>
																	</Group>
																</Anchor>
															) : null}
														</Stack>
													</Group>
												</Card>
											)
										})}
									</Stack>
								) : (
									<Text size="sm" c="dimmed">
										No certificates yet. Once a course is marked completed and a certificate is issued, it’ll show up here.
									</Text>
								)}
							</Card>
						</Stack>
					)}
				</Tabs.Panel>

				<Tabs.Panel value="civic" pt="md">
					{!profile ? (
						<Card withBorder radius="lg" p="lg">
							<Group justify="space-between" align="flex-start" wrap="nowrap">
								<Group gap="xs">
									<ThemeIcon variant="light" radius="xl" size={36} color="violet">
										<IconThumbsUp size={18} />
									</ThemeIcon>
									<Stack gap={0}>
										<Text fw={700}>Civic</Text>
										<Text c="dimmed" size="sm">
											Vote on proposals and earn civic points.
										</Text>
									</Stack>
								</Group>
								<ThemeIcon variant="light" radius="xl" size={36} style={{ flexShrink: 0 }} color="green">
									<IconPlusCircle size={18} />
								</ThemeIcon>
							</Group>
						</Card>
					) : (
						<Stack gap="md">
							<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
								<Card withBorder radius="lg" p="md">
									<Group justify="space-between">
										<Stack gap={2}>
											<Text c="dimmed" size="sm">
												Civic points
											</Text>
											<Title order={3}>{profile.civicPoints}</Title>
										</Stack>
										<ThemeIcon variant="light" radius="xl" size={34} color="violet">
											<IconThumbsUp size={18} />
										</ThemeIcon>
									</Group>
								</Card>

								<Card withBorder radius="lg" p="md">
									<Group justify="space-between">
										<Stack gap={2}>
											<Text c="dimmed" size="sm">
												Votes cast
											</Text>
											<Title order={3}>{votedProposalIds.size}</Title>
										</Stack>
										<ThemeIcon variant="light" radius="xl" size={34} color="indigo">
											<IconClipboard size={18} />
										</ThemeIcon>
									</Group>
								</Card>

								<Card withBorder radius="lg" p="md">
									<Group justify="space-between">
										<Stack gap={2}>
											<Text c="dimmed" size="sm">
												Latest vote
											</Text>
											<Badge variant="light" color={votedProposalIds.size ? "blue" : "gray"}>
												{votedProposalIds.size ? `#${voteRows[0]?.proposalId ?? ""}` : "—"}
											</Badge>
										</Stack>
										<ThemeIcon variant="light" radius="xl" size={34} color="violet">
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
											<Badge variant="light" color={votedProposalIds.size ? "green" : "gray"}>
												{votedProposalIds.size ? "Active citizen" : "No votes yet"}
											</Badge>
										</Stack>
										<ThemeIcon variant="light" radius="xl" size={34} color="indigo">
											<IconClipboard size={18} />
										</ThemeIcon>
									</Group>
								</Card>
							</SimpleGrid>

							<Card withBorder radius="lg" p="lg">
								<Group justify="space-between" align="flex-start">
									<Group gap="xs">
										<ThemeIcon variant="light" radius="xl" size={20} color="violet">
											<IconClipboard size={12} />
										</ThemeIcon>
										<Text fw={700}>Your votes</Text>
									</Group>
									<Badge variant="light">{votedProposalIds.size} total</Badge>
								</Group>
								<Divider my="sm" />

								{voteRows.length ? (
									<Stack gap={10}>
										{voteRows.map((v) => (
											<Card key={v.proposalId} withBorder radius="md" p="md">
												<Group justify="space-between" align="flex-start" wrap="nowrap">
													<Stack gap={2} style={{ minWidth: 0 }}>
														<Text fw={600} size="sm" lineClamp={1}>
															{v.title}
														</Text>
														<Text size="xs" c="dimmed">
															Proposal #{v.proposalId}
														</Text>
													</Stack>
													<Badge variant="light" color={v.choice === 1 ? "green" : "red"} style={{ flexShrink: 0 }}>
														{v.choice === 1 ? "Yes" : "No"}
													</Badge>
												</Group>
											</Card>
										))}
									</Stack>
								) : (
									<Text size="sm" c="dimmed">
										No votes yet. Head to the Proposals tab to vote.
									</Text>
								)}
							</Card>
						</Stack>
					)}
				</Tabs.Panel>

				<Tabs.Panel value="debug" pt="md">
					<Stack gap="md">
						<Card withBorder radius="lg" p="lg">
							<Group justify="space-between" align="flex-start" wrap="nowrap">
								<Group gap="xs" wrap="nowrap">
									<ThemeIcon variant="light" radius="xl" size={36} color="gray">
										<IconClipboard size={18} />
									</ThemeIcon>
									<Stack gap={0}>
										<Text fw={700}>Debug</Text>
										<Text c="dimmed" size="sm">
											Helpful identifiers for troubleshooting and support.
										</Text>
									</Stack>
								</Group>
								<Button
									variant="light"
									size="xs"
									leftSection={<IconRefreshCw size={14} />}
									onClick={refreshAll}
									disabled={!account}
									style={{ flexShrink: 0 }}
								>
									Refresh data
								</Button>
							</Group>
						</Card>

						<SimpleGrid cols={{ base: 1, md: 2 }}>
							<Card withBorder radius="lg" p="lg">
								<Group gap="xs" mb="xs">
									<IconUser size={16} />
									<Text fw={600}>Wallet</Text>
								</Group>
								<Text size="sm" c="dimmed">
									Connected address
								</Text>
								<Group justify="space-between" mt="xs" wrap="nowrap">
									<Code>{account?.address ?? "Not connected"}</Code>
									{account?.address ? (
										<Tooltip label="Copy address" withArrow>
											<ActionIcon variant="light" onClick={onCopyAddress} aria-label="Copy address">
												<IconCopy size={16} />
											</ActionIcon>
										</Tooltip>
									) : null}
								</Group>
								<Text size="xs" c="dimmed" mt="sm">
									Network: <Code>sui:{APP_CONFIG.network}</Code>
								</Text>
							</Card>

							<Card withBorder radius="lg" p="lg">
								<Group gap="xs" mb="xs">
									<IconClipboard size={16} />
									<Text fw={600}>Profile</Text>
								</Group>
								<Text size="sm" c="dimmed">
									Profile object id
								</Text>
								{!profile ? <Code>—</Code> : <Code>{profile.objectId}</Code>}
								<Divider my="sm" />
								<Text size="xs" c="dimmed">
									Certificates: <b>{certificates.length}</b> • Enrolled (in progress): <b>{inProgressEnrollmentCount}</b> • Votes:{" "}
									<b>{votedProposalIds.size}</b>
								</Text>
							</Card>
						</SimpleGrid>
					</Stack>
				</Tabs.Panel>
			</Tabs>

			<Text size="xs" c="dimmed">
				Using chain: sui:{APP_CONFIG.network}
			</Text>

			<Modal
				opened={metadataModalOpened}
				onClose={() => {
					setMetadataModalOpened(false)
					setCertificateMetadata(null)
					setSelectedCertificateId(null)
				}}
				title={
					<Group gap="xs">
						<ThemeIcon variant="light" radius="xl" size={24} color="yellow">
							<IconAward size={14} />
						</ThemeIcon>
						<Text fw={600}>Certificate Metadata</Text>
					</Group>
				}
				size="lg"
			>
				{metadataLoading ? (
					<Stack gap="md" align="center" py="xl">
						<ClipLoader color="var(--mantine-color-blue-6)" size={40} />
						<Text c="dimmed">Loading certificate metadata...</Text>
					</Stack>
				) : certificateMetadata ? (
					<Stack gap="md">
						<Card withBorder radius="md" p="md">
							<Stack gap="sm">
								<Group justify="space-between" align="flex-start">
									<Stack gap={4}>
										<Text size="xs" c="dimmed">
											Certificate Name
										</Text>
										<Text fw={600} size="sm">
											{certificateMetadata.name}
										</Text>
									</Stack>
									<ThemeIcon variant="light" radius="xl" size={40} color="yellow">
										<IconAward size={20} />
									</ThemeIcon>
								</Group>
								<Divider />
								<Stack gap={4}>
									<Text size="xs" c="dimmed">
										Description
									</Text>
									<Text size="sm">{certificateMetadata.description}</Text>
								</Stack>
							</Stack>
						</Card>

						<Card withBorder radius="md" p="md">
							<Stack gap="sm">
								<Text size="sm" fw={600} mb="xs">
									Certificate Details
								</Text>
								<SimpleGrid cols={2} spacing="sm">
									{certificateMetadata.attributes.map((attr, idx) => {
										if (attr.value === null) return null
										const label =
											attr.trait_type === "course_id"
												? "Course ID"
												: attr.trait_type === "certificate_object_id"
												? "Certificate ID"
												: attr.trait_type.charAt(0).toUpperCase() + attr.trait_type.slice(1).replace(/_/g, " ")
										return (
											<Stack key={idx} gap={2}>
												<Text size="xs" c="dimmed">
													{label}
												</Text>
												{attr.trait_type === "student" ? (
													<Code>{shortAddress(attr.value)}</Code>
												) : attr.trait_type === "certificate_object_id" ? (
													<Code style={{ fontSize: "11px", wordBreak: "break-all" }}>{attr.value}</Code>
												) : (
													<Text size="sm" fw={500}>
														{attr.value}
													</Text>
												)}
											</Stack>
										)
									})}
								</SimpleGrid>
							</Stack>
						</Card>

						<Group justify="space-between" align="center">
							<Anchor href={certificateMetadata.external_url} target="_blank" rel="noreferrer" size="sm">
								<Group gap={6}>
									<IconArrowRight size={14} />
									<span>View on Sui Explorer</span>
								</Group>
							</Anchor>
							{selectedCertificateId && (
								<Tooltip label="Copy certificate ID" withArrow>
									<ActionIcon
										variant="light"
										onClick={async () => {
											await navigator.clipboard.writeText(selectedCertificateId)
											notifications.show({ message: "Certificate ID copied" })
										}}
										aria-label="Copy certificate ID"
									>
										<IconCopy size={16} />
									</ActionIcon>
								</Tooltip>
							)}
						</Group>
					</Stack>
				) : null}
			</Modal>
		</Stack>
	)
}
