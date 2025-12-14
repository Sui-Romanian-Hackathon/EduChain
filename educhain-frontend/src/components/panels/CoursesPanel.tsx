"use client"

import { useMemo, useState } from "react"
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
	TextInput,
	Tooltip,
	ThemeIcon,
	Divider
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit"
import { useQueryClient } from "@tanstack/react-query"
import { useCourses } from "@/lib/useCourses"
import { useProfile } from "@/lib/useProfile"
import { useEnrollments } from "@/lib/useEnrollments"
import { useResults } from "@/lib/useResults"
import { buildCreateProfileTx, buildEnrollTx } from "@/lib/sui"
import { APP_CONFIG, suiChainId } from "@/lib/config"
import { IconArrowRight, IconBookOpen, IconCheckCircle, IconPlusCircle, IconSearch } from "@/components/icons/feather"
import { refreshAfterTx } from "@/lib/refreshAfterTx"

export function CoursesPanel() {
	const client = useSuiClient()
	const queryClient = useQueryClient()
	const account = useCurrentAccount()
	const { profile } = useProfile()
	const { courses, loading, source } = useCourses(50)
	const { enrollments } = useEnrollments(200)
	const { completedCourseIds } = useResults(500)

	const { mutate: signAndExecuteTransaction, isPending: txPending } = useSignAndExecuteTransaction()
	const [filter, setFilter] = useState("")

	const filtered = useMemo(() => {
		const q = filter.trim().toLowerCase()
		if (!q) return courses
		return courses.filter((c) => (c.title ?? "").toLowerCase().includes(q))
	}, [courses, filter])

	const onCreateProfile = async () => {
		if (!APP_CONFIG.packageId) {
			notifications.show({
				color: "red",
				title: "Missing configuration",
				message: "Set NEXT_PUBLIC_SUI_PACKAGE_ID in educhain-frontend/.env.local and restart `npm run dev`."
			})
			return
		}
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

	const onEnroll = async (courseId: number) => {
		if (!profile) {
			notifications.show({ color: "yellow", title: "No Profile", message: "Create your Profile first." })
			return
		}
		try {
			const tx = await buildEnrollTx(client as any, { profileId: profile.objectId, courseId })
			signAndExecuteTransaction(
				{ transaction: tx as any, chain: suiChainId(APP_CONFIG.network) },
				{
					onSuccess: (res) => {
						notifications.show({ title: "Enrolled", message: `Tx: ${res.digest}` })
						void refreshAfterTx({ client: client as any, queryClient, digest: res.digest })
					},
					onError: (e) => notifications.show({ color: "red", title: "Transaction failed", message: e.message })
				}
			)
		} catch (e: any) {
			notifications.show({ color: "red", title: "Error", message: e.message ?? "Unknown error" })
		}
	}

	const chainHint = `Using chain: sui:${APP_CONFIG.network}`
	const canCreateProfile = Boolean(account) && Boolean(APP_CONFIG.packageId)
	const totalCourses = courses.length
	const enrolledCount = enrollments.length
	const completedCount = completedCourseIds.size

	return (
		<Stack gap="md">
			<Stack gap="md">
				<Stack gap={0}>
					<Group gap="xs" align="center">
						<IconBookOpen size={20} />
						<Title order={2}>Courses</Title>
					</Group>
					<Text size="sm" c="dimmed">
						Browse courses and enroll (writes to your owned Profile).
					</Text>
				</Stack>

				<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
					<Card withBorder radius="lg" p="md">
						<Group justify="space-between">
							<Stack gap={2}>
								<Text c="dimmed" size="sm">
									Courses
								</Text>
								<Title order={3}>{totalCourses}</Title>
							</Stack>
							<ThemeIcon variant="light" radius="xl" size={34}>
								<IconBookOpen size={18} />
							</ThemeIcon>
						</Group>
					</Card>
					<Card withBorder radius="lg" p="md">
						<Group justify="space-between">
							<Stack gap={2}>
								<Text c="dimmed" size="sm">
									Enrolled
								</Text>
								<Title order={3}>{enrolledCount}</Title>
							</Stack>
							<ThemeIcon variant="light" radius="xl" size={34}>
								<IconArrowRight size={18} />
							</ThemeIcon>
						</Group>
					</Card>
					<Card withBorder radius="lg" p="md">
						<Group justify="space-between">
							<Stack gap={2}>
								<Text c="dimmed" size="sm">
									Completed
								</Text>
								<Title order={3}>{completedCount}</Title>
							</Stack>
							<ThemeIcon variant="light" radius="xl" size={34}>
								<IconCheckCircle size={18} />
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
									{profile ? "Profile ready" : "Create Profile to enroll"}
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
						<Tooltip
							label="Set NEXT_PUBLIC_SUI_PACKAGE_ID in educhain-frontend/.env.local and restart `npm run dev`."
							disabled={canCreateProfile}
							withArrow
						>
							<Button
								onClick={onCreateProfile}
								loading={txPending}
								disabled={!canCreateProfile}
								visibleFrom="sm"
								leftSection={<IconPlusCircle size={16} />}
							>
								Create Profile
							</Button>
						</Tooltip>
						<Tooltip
							label="Set NEXT_PUBLIC_SUI_PACKAGE_ID in educhain-frontend/.env.local and restart `npm run dev`."
							disabled={canCreateProfile}
							withArrow
						>
							<Button
								onClick={onCreateProfile}
								loading={txPending}
								disabled={!canCreateProfile}
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
				placeholder="Search courses…"
				value={filter}
				onChange={(e) => setFilter(e.currentTarget.value)}
				leftSection={<IconSearch size={16} />}
			/>

			{!loading && totalCourses === 0 ? (
				<Card withBorder radius="lg" p="lg">
					<Group justify="space-between" align="flex-start" wrap="nowrap">
						<Stack gap={6}>
							<Group gap="xs">
								<ThemeIcon variant="light" radius="xl" size={36}>
									<IconBookOpen size={18} />
								</ThemeIcon>
								<Stack gap={0}>
									<Text fw={700}>No courses yet</Text>
									<Text size="sm" c="dimmed">
										Once a teacher publishes courses (Admin → Create course), they’ll appear here.
									</Text>
								</Stack>
							</Group>
							<Divider />
							<Text size="sm" c="dimmed">
								Tip: if you just created a course, it may take a moment for events to index—try the Refresh button in Profile.
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
			) : filtered.length ? (
				<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
					{filtered.map((c) => {
						const isEnrolled = enrollments.some((e) => e.courseId === c.id)
						const done = completedCourseIds.has(c.id)
						return (
							<Card key={c.objectId} withBorder radius="lg" p="lg">
								<Stack gap="xs">
									<Group justify="space-between" align="flex-start">
										<Group gap="xs" align="center" style={{ minWidth: 0 }}>
											<IconBookOpen size={16} />
											<Title order={4} style={{ minWidth: 0 }}>
												{c.title ?? `Course #${c.id}`}
											</Title>
										</Group>
										<Badge variant="light">#{c.id}</Badge>
									</Group>
									{c.contentUri && (
										<Text
											size="sm"
											c="dimmed"
											lineClamp={2}
											component="a"
											href={c.contentUri}
											target="_blank"
											rel="noreferrer"
											style={{ textDecoration: "underline" }}
										>
											{c.contentUri}
										</Text>
									)}
									<Group justify="space-between" mt="sm">
										<Badge color={done ? "green" : isEnrolled ? "blue" : "gray"} variant="light">
											{done ? "Completed" : isEnrolled ? "Enrolled" : "Not enrolled"}
										</Badge>
										<Button
											size="sm"
											variant={done || isEnrolled ? "light" : "filled"}
											disabled={!profile || done || isEnrolled}
											loading={txPending}
											onClick={() => onEnroll(c.id)}
											leftSection={
												done || isEnrolled ? <IconCheckCircle size={16} /> : <IconArrowRight size={16} />
											}
										>
											{done ? "Done" : isEnrolled ? "Enrolled" : "Enroll"}
										</Button>
									</Group>
								</Stack>
							</Card>
						)
					})}
				</SimpleGrid>
			) : totalCourses > 0 ? (
				<Card withBorder radius="lg" p="lg">
					<Group justify="space-between" align="flex-start" wrap="nowrap">
						<Group gap="xs" wrap="nowrap">
							<ThemeIcon variant="light" radius="xl" size={36}>
								<IconSearch size={18} />
							</ThemeIcon>
							<Stack gap={0}>
								<Text fw={700}>No matches</Text>
								<Text size="sm" c="dimmed">
									No courses match “{filter.trim()}”. Try a different search.
								</Text>
							</Stack>
						</Group>
						<Button variant="light" size="xs" onClick={() => setFilter("")} style={{ flexShrink: 0 }}>
							Clear
						</Button>
					</Group>
				</Card>
			) : null}

			<Text size="xs" c="dimmed">
				{chainHint} (data source: {source})
			</Text>
		</Stack>
	)
}
