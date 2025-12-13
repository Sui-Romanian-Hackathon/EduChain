"use client"

import { useMemo, useState } from "react"
import { Card, Text, Title, SimpleGrid, Button, Group, Stack, Skeleton, Badge, TextInput, Tooltip } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit"
import { useCourses } from "@/lib/useCourses"
import { useProfile } from "@/lib/useProfile"
import { useEnrollments } from "@/lib/useEnrollments"
import { useResults } from "@/lib/useResults"
import { buildCreateProfileTx, buildEnrollTx } from "@/lib/sui"
import { APP_CONFIG, suiChainId } from "@/lib/config"

export function CoursesPanel() {
	const client = useSuiClient()
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

	return (
		<Stack gap="md">
			<Stack gap="md">
				<Stack gap={0}>
					<Title order={2}>Courses</Title>
					<Text size="sm" c="dimmed">
						Browse courses and enroll (writes to your owned Profile).
					</Text>
				</Stack>

				{!profile && (
					<Group>
						<Tooltip
							label="Set NEXT_PUBLIC_SUI_PACKAGE_ID in educhain-frontend/.env.local and restart `npm run dev`."
							disabled={canCreateProfile}
							withArrow
						>
							<Button onClick={onCreateProfile} loading={txPending} disabled={!canCreateProfile} visibleFrom="sm">
								Create Profile
							</Button>
						</Tooltip>
						<Tooltip
							label="Set NEXT_PUBLIC_SUI_PACKAGE_ID in educhain-frontend/.env.local and restart `npm run dev`."
							disabled={canCreateProfile}
							withArrow
						>
							<Button onClick={onCreateProfile} loading={txPending} disabled={!canCreateProfile} fullWidth hiddenFrom="sm">
								Create Profile
							</Button>
						</Tooltip>
					</Group>
				)}
			</Stack>

			<TextInput placeholder="Search courses…" value={filter} onChange={(e) => setFilter(e.currentTarget.value)} />

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
			) : (
				<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
					{filtered.map((c) => {
						const isEnrolled = enrollments.some((e) => e.courseId === c.id)
						const done = completedCourseIds.has(c.id)
						return (
							<Card key={c.objectId} withBorder radius="lg" p="lg">
								<Stack gap="xs">
									<Group justify="space-between" align="flex-start">
										<Title order={4}>{c.title ?? `Course #${c.id}`}</Title>
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
										>
											{done ? "Done" : isEnrolled ? "Enrolled" : "Enroll"}
										</Button>
									</Group>
								</Stack>
							</Card>
						)
					})}
				</SimpleGrid>
			)}

			<Text size="xs" c="dimmed">
				{chainHint} (data source: {source})
			</Text>
		</Stack>
	)
}
