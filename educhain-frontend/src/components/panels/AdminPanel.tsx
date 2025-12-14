"use client"

import { useEffect, useMemo, useState } from "react"
import {
	Alert,
	Button,
	Card,
	Group,
	NumberInput,
	Stack,
	Text,
	TextInput,
	Textarea,
	Title,
	Code,
	Select,
	SimpleGrid,
	ThemeIcon,
	Badge,
	Divider
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { IconInfoCircle } from "@tabler/icons-react"
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit"
import { useQueryClient } from "@tanstack/react-query"
import { APP_CONFIG, suiChainId } from "@/lib/config"
import { buildCreateCourseTx, buildCreateProposalTx, buildSubmitResultAndIssueCertificateTx, structType } from "@/lib/sui"
import { useCaps } from "@/lib/useCaps"
import { useCourses } from "@/lib/useCourses"
import {
	IconAward,
	IconBookOpen,
	IconCheckCircle,
	IconClipboard,
	IconPlusCircle,
	IconSettings,
	IconUser
} from "@/components/icons/feather"
import { refreshAfterTx } from "@/lib/refreshAfterTx"
import { ClipLoader } from "react-spinners"

export function AdminPanel() {
	const client = useSuiClient()
	const queryClient = useQueryClient()
	const account = useCurrentAccount()
	const { caps } = useCaps()
	const { courses } = useCourses(200)
	const { mutate: signAndExecuteTransaction, isPending: txPending } = useSignAndExecuteTransaction()

	const initializedEventType = useMemo(() => (APP_CONFIG.packageId ? structType("educhain", "Initialized") : ""), [])
	const initialized = useSuiClientQuery(
		"queryEvents",
		{
			query: { MoveEventType: initializedEventType },
			limit: 1,
			order: "descending"
		},
		{ enabled: Boolean(APP_CONFIG.packageId && initializedEventType) }
	)

	const initInfo = useMemo(() => {
		const evt: any = initialized.data?.data?.[0]
		const pj = evt?.parsedJson ?? null
		if (!pj || typeof pj !== "object") return null
		return {
			publisher: pj.publisher ? String(pj.publisher) : null,
			courseCatalogId: pj.course_catalog_id ? String(pj.course_catalog_id) : null,
			proposalRegistryId: pj.proposal_registry_id ? String(pj.proposal_registry_id) : null,
			teacherCapId: pj.teacher_cap_id ? String(pj.teacher_cap_id) : null,
			adminCapId: pj.admin_cap_id ? String(pj.admin_cap_id) : null,
			issuerCapId: pj.issuer_cap_id ? String(pj.issuer_cap_id) : null
		}
	}, [initialized.data])

	const [courseTitle, setCourseTitle] = useState("")
	const [courseUri, setCourseUri] = useState("")

	const [proposalTitle, setProposalTitle] = useState("")
	const [proposalDesc, setProposalDesc] = useState("")

	const [completeCourseId, setCompleteCourseId] = useState<string>("")
	const [completeStudent, setCompleteStudent] = useState("")
	const [completeScore, setCompleteScore] = useState<number>(100)
	const [completeMetadataUri, setCompleteMetadataUri] = useState("")

	const hasTeacher = Boolean(caps.teacherCapId)
	const hasAdmin = Boolean(caps.adminCapId)
	const hasIssuer = Boolean(caps.issuerCapId)

	const courseOptions = useMemo(
		() =>
			courses.map((c) => ({
				value: String(c.id),
				label: `${c.title ?? `Course #${c.id}`} (#${c.id})`
			})),
		[courses]
	)

	// Auto-select first course once loaded (only if nothing selected yet)
	useEffect(() => {
		if (!completeCourseId && courseOptions.length) setCompleteCourseId(courseOptions[0].value)
	}, [courseOptions, completeCourseId])

	const createCourse = async () => {
		if (!APP_CONFIG.packageId || !APP_CONFIG.courseCatalogId) {
			notifications.show({
				color: "red",
				title: "Missing configuration",
				message: "Set NEXT_PUBLIC_SUI_PACKAGE_ID and NEXT_PUBLIC_COURSE_CATALOG_ID in educhain-frontend/.env.local and restart."
			})
			return
		}
		if (!caps.teacherCapId) {
			notifications.show({ color: "yellow", title: "Missing TeacherCap", message: "This wallet has no TeacherCap." })
			return
		}
		try {
			const tx = await buildCreateCourseTx(client as any, {
				teacherCapId: caps.teacherCapId,
				title: courseTitle || "Untitled course",
				contentUri: courseUri || "ipfs://... or https://..."
			})
			signAndExecuteTransaction(
				{ transaction: tx as any, chain: suiChainId(APP_CONFIG.network) },
				{
					onSuccess: (res) => {
						notifications.show({ title: "Course created", message: `Tx: ${res.digest}` })
						void refreshAfterTx({ client: client as any, queryClient, digest: res.digest })
					},
					onError: (e) => notifications.show({ color: "red", title: "Transaction failed", message: e.message })
				}
			)
		} catch (e: any) {
			notifications.show({ color: "red", title: "Error", message: e.message ?? "Unknown error" })
		}
	}

	const createProposal = async () => {
		if (!APP_CONFIG.packageId || !APP_CONFIG.proposalRegistryId) {
			notifications.show({
				color: "red",
				title: "Missing configuration",
				message:
					"Set NEXT_PUBLIC_SUI_PACKAGE_ID and NEXT_PUBLIC_PROPOSAL_REGISTRY_ID in educhain-frontend/.env.local and restart."
			})
			return
		}
		if (!caps.adminCapId) {
			notifications.show({ color: "yellow", title: "Missing AdminCap", message: "This wallet has no AdminCap." })
			return
		}
		try {
			const tx = await buildCreateProposalTx(client as any, {
				adminCapId: caps.adminCapId,
				title: proposalTitle || "Untitled proposal",
				description: proposalDesc || "Description…"
			})
			signAndExecuteTransaction(
				{ transaction: tx as any, chain: suiChainId(APP_CONFIG.network) },
				{
					onSuccess: (res) => {
						notifications.show({ title: "Proposal created", message: `Tx: ${res.digest}` })
						void refreshAfterTx({ client: client as any, queryClient, digest: res.digest })
					},
					onError: (e) => notifications.show({ color: "red", title: "Transaction failed", message: e.message })
				}
			)
		} catch (e: any) {
			notifications.show({ color: "red", title: "Error", message: e.message ?? "Unknown error" })
		}
	}

	const completeAndIssue = async () => {
		if (!APP_CONFIG.packageId || !APP_CONFIG.courseCatalogId) {
			notifications.show({
				color: "red",
				title: "Missing configuration",
				message: "Set NEXT_PUBLIC_SUI_PACKAGE_ID and NEXT_PUBLIC_COURSE_CATALOG_ID in educhain-frontend/.env.local and restart."
			})
			return
		}
		if (!caps.teacherCapId) {
			notifications.show({ color: "yellow", title: "Missing TeacherCap", message: "This wallet has no TeacherCap." })
			return
		}
		if (!caps.issuerCapId) {
			notifications.show({ color: "yellow", title: "Missing IssuerCap", message: "This wallet has no IssuerCap." })
			return
		}

		const student = completeStudent.trim()
		if (!student || !student.startsWith("0x")) {
			notifications.show({ color: "yellow", title: "Invalid student address", message: "Enter a valid Sui address." })
			return
		}
		if (!completeCourseId) {
			notifications.show({ color: "yellow", title: "Select a course", message: "Pick a course from the dropdown." })
			return
		}

		try {
			const tx = await buildSubmitResultAndIssueCertificateTx(client as any, {
				teacherCapId: caps.teacherCapId,
				issuerCapId: caps.issuerCapId,
				courseId: completeCourseId,
				student,
				score: completeScore ?? 0,
				metadataUri: completeMetadataUri || ""
			})
			signAndExecuteTransaction(
				{ transaction: tx as any, chain: suiChainId(APP_CONFIG.network) },
				{
					onSuccess: (res) => {
						notifications.show({ title: "Completed + certificate issued", message: `Tx: ${res.digest}` })
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
			<Group justify="space-between" align="flex-end">
				<Stack gap={0}>
					<Group gap="xs" align="center">
						<IconSettings size={20} />
						<Title order={2}>Admin</Title>
					</Group>
					<Text size="sm" c="dimmed">
						If your wallet owns capability objects, you can publish courses and create proposals.
					</Text>
				</Stack>
			</Group>

			<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
				<Card withBorder radius="lg" p="md">
					<Group justify="space-between">
						<Stack gap={2}>
							<Text c="dimmed" size="sm">
								Wallet
							</Text>
							<Badge variant="light" color={account ? "blue" : "gray"}>
								{account ? "Connected" : "Not connected"}
							</Badge>
						</Stack>
						<ThemeIcon variant="light" radius="xl" size={34}>
							<IconUser size={18} />
						</ThemeIcon>
					</Group>
				</Card>

				<Card withBorder radius="lg" p="md">
					<Group justify="space-between">
						<Stack gap={2}>
							<Text c="dimmed" size="sm">
								TeacherCap
							</Text>
							<Badge variant="light" color={hasTeacher ? "green" : "gray"}>
								{hasTeacher ? "Enabled" : "Missing"}
							</Badge>
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
								AdminCap
							</Text>
							<Badge variant="light" color={hasAdmin ? "green" : "gray"}>
								{hasAdmin ? "Enabled" : "Missing"}
							</Badge>
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
								IssuerCap
							</Text>
							<Badge variant="light" color={hasIssuer ? "green" : "gray"}>
								{hasIssuer ? "Enabled" : "Missing"}
							</Badge>
						</Stack>
						<ThemeIcon variant="light" radius="xl" size={34}>
							<IconAward size={18} />
						</ThemeIcon>
					</Group>
				</Card>
			</SimpleGrid>

			<Card withBorder radius="lg" p="lg">
				<Group gap="xs" align="center">
					<ThemeIcon variant="light" radius="xl" size={36}>
						<IconInfoCircle size={18} />
					</ThemeIcon>
					<Stack gap={0}>
						<Text fw={700}>Capabilities</Text>
						<Text size="sm" c="dimmed">
							These object IDs determine which admin actions your wallet is allowed to perform.
						</Text>
					</Stack>
				</Group>
				<Divider my="sm" />
				<Stack gap={6}>
					<Text size="sm">
						TeacherCap: <Code>{caps.teacherCapId ?? "—"}</Code>
					</Text>
					<Text size="sm">
						AdminCap: <Code>{caps.adminCapId ?? "—"}</Code>
					</Text>
					<Text size="sm">
						IssuerCap: <Code>{caps.issuerCapId ?? "—"}</Code>
					</Text>
				</Stack>
			</Card>

			<Alert icon={<IconInfoCircle size={18} />} title="init_state (Initialized event)" radius="lg">
				{!APP_CONFIG.packageId ? (
					<Text size="sm">
						Set <Code>NEXT_PUBLIC_SUI_PACKAGE_ID</Code> to enable chain lookup.
					</Text>
				) : initialized.isPending ? (
					<Group gap="xs">
						<ClipLoader color="var(--mantine-color-blue-6)" size={16} />
						<Text size="sm">Loading latest Initialized event from chain…</Text>
					</Group>
				) : !initInfo ? (
					<Text size="sm" c="dimmed">
						No Initialized event found for this package on {APP_CONFIG.network}. That usually means <Code>init_state</Code> hasn’t
						been called yet (or you’re on the wrong network).
					</Text>
				) : (
					<Stack gap={6}>
						<Text size="sm">
							Publisher (received caps): <Code>{initInfo.publisher ?? "—"}</Code>
						</Text>
						{account?.address && initInfo.publisher && account.address !== initInfo.publisher && (
							<Text size="sm" c="yellow">
								Your connected wallet (<Code>{account.address}</Code>) is different from the publisher above, so it won’t have the
								caps unless they were transferred to you.
							</Text>
						)}
						<Text size="sm">
							TeacherCap id: <Code>{initInfo.teacherCapId ?? "—"}</Code>
						</Text>
						<Text size="sm">
							AdminCap id: <Code>{initInfo.adminCapId ?? "—"}</Code>
						</Text>
						<Text size="sm">
							IssuerCap id: <Code>{initInfo.issuerCapId ?? "—"}</Code>
						</Text>
					</Stack>
				)}
			</Alert>

			<Card withBorder radius="lg" p="lg">
				<Group gap="xs" align="center">
					<IconBookOpen size={16} />
					<Title order={4}>Create course</Title>
				</Group>
				<Stack mt="sm">
					<TextInput label="Title" value={courseTitle} onChange={(e) => setCourseTitle(e.currentTarget.value)} />
					<TextInput
						label="Content URI"
						description="A link to the course module: IPFS / Arweave / HTTPS"
						value={courseUri}
						onChange={(e) => setCourseUri(e.currentTarget.value)}
					/>
					<Group justify="flex-end">
						<Button onClick={createCourse} loading={txPending} disabled={!account} leftSection={<IconPlusCircle size={16} />}>
							Create course
						</Button>
					</Group>
				</Stack>
			</Card>

			<Card withBorder radius="lg" p="lg">
				<Group gap="xs" align="center">
					<IconCheckCircle size={16} />
					<Title order={4}>Complete course + issue certificate</Title>
				</Group>
				<Text size="sm" c="dimmed" mt={4}>
					One click. This submits the result (completed + score) and issues the owned Certificate in the same transaction.
					Requires <b>TeacherCap</b> + <b>IssuerCap</b>.
				</Text>
				<Stack mt="sm">
					<Select
						label="Course"
						placeholder={courseOptions.length ? "Select a course…" : "No courses found yet"}
						data={courseOptions}
						value={completeCourseId}
						onChange={(v) => setCompleteCourseId(v ?? "")}
						searchable
						nothingFoundMessage="No matching courses"
						disabled={!courseOptions.length}
					/>
					<TextInput
						label="Student address"
						placeholder="0x..."
						value={completeStudent}
						onChange={(e) => setCompleteStudent(e.currentTarget.value)}
					/>
					<NumberInput label="Score" value={completeScore} onChange={(v) => setCompleteScore(Number(v))} min={0} />
					<TextInput
						label="Metadata URI"
						description='Optional. You can leave this blank and use the "Hosted metadata" link shown on Profile after mint.'
						value={completeMetadataUri}
						onChange={(e) => setCompleteMetadataUri(e.currentTarget.value)}
					/>
					<Group justify="flex-end">
						<Button onClick={completeAndIssue} loading={txPending} disabled={!account} leftSection={<IconAward size={16} />}>
							Complete + Issue
						</Button>
					</Group>
				</Stack>
			</Card>

			<Card withBorder radius="lg" p="lg">
				<Group gap="xs" align="center">
					<IconClipboard size={16} />
					<Title order={4}>Create proposal</Title>
				</Group>
				<Stack mt="sm">
					<TextInput label="Title" value={proposalTitle} onChange={(e) => setProposalTitle(e.currentTarget.value)} />
					<Textarea
						label="Description"
						minRows={3}
						value={proposalDesc}
						onChange={(e) => setProposalDesc(e.currentTarget.value)}
					/>
					<Group justify="flex-end">
						<Button onClick={createProposal} loading={txPending} disabled={!account} leftSection={<IconPlusCircle size={16} />}>
							Create proposal
						</Button>
					</Group>
				</Stack>
			</Card>

			<Text size="xs" c="dimmed">
				Using chain: sui:{APP_CONFIG.network}
			</Text>
		</Stack>
	)
}
