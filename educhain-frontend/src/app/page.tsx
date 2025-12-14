"use client"

import Link from "next/link"
import Image from "next/image"
import {
	Container,
	Title,
	Text,
	Button,
	Group,
	Card,
	Stack,
	SimpleGrid,
	ThemeIcon,
	List,
	Divider,
	Badge,
	Box
} from "@mantine/core"
import {
	IconArrowRight,
	IconAward,
	IconBookOpen,
	IconClipboard,
	IconExternalLink,
	IconFileText,
	IconPlusCircle,
	IconThumbsUp
} from "@/components/icons/feather"

export default function HomePage() {
	return (
		<Container size="md" py="xl">
			<Stack gap="lg">
				<Stack gap={8}>
					<Group gap="xs" align="center">
						<Box
							w={128}
							h={128}
							style={{
								borderRadius: 24,
								overflow: "hidden",
								flexShrink: 0,
								boxShadow: "var(--mantine-shadow-md)"
							}}
						>
							<Image
								src="/eduChainLogo.png"
								alt="EduChain logo"
								width={128}
								height={128}
								priority
								style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
							/>
						</Box>
						<Stack gap={0}>
							<Title order={1}>EduCityChain</Title>
							<Text c="dimmed">
								Education + civic engagement on Sui: enroll in courses, earn credentials, and vote on community proposals.
							</Text>
						</Stack>
					</Group>
					<Group gap="xs">
						<Badge variant="light" leftSection={<IconFileText size={14} />}>
							Verifiable certificates
						</Badge>
						<Badge variant="light" leftSection={<IconThumbsUp size={14} />}>
							Civic participation
						</Badge>
						<Badge variant="light" leftSection={<IconClipboard size={14} />}>
							On-chain proposals
						</Badge>
					</Group>
				</Stack>

				<Card withBorder radius="lg" p="lg">
					<Stack>
						<Group gap="xs" align="center">
							<IconArrowRight size={18} />
							<Title order={3}>Start</Title>
						</Group>
						<Text c="dimmed">A quick path from “new user” to “active citizen”.</Text>
						<List
							spacing={6}
							icon={
								<ThemeIcon size={18} radius="xl" variant="light">
									<IconPlusCircle size={12} />
								</ThemeIcon>
							}
						>
							<List.Item>
								<b>Connect wallet</b> and create your Profile
							</List.Item>
							<List.Item>
								<b>Enroll</b> in a course and complete it
							</List.Item>
							<List.Item>
								<b>Earn</b> a certificate and <b>vote</b> on proposals
							</List.Item>
						</List>
						<Group wrap="wrap">
							<Button component={Link} href="/dashboard" fullWidth hiddenFrom="xs" rightSection={<IconArrowRight size={16} />}>
								Open dashboard
							</Button>
							<Button component={Link} href="/dashboard" visibleFrom="xs" rightSection={<IconArrowRight size={16} />}>
								Open dashboard
							</Button>
							<Button
								component="a"
								variant="light"
								href="https://sdk.mystenlabs.com/dapp-kit"
								target="_blank"
								rel="noreferrer"
								fullWidth
								hiddenFrom="xs"
								rightSection={<IconExternalLink size={16} />}
							>
								Sui dApp Kit docs
							</Button>
							<Button
								component="a"
								variant="light"
								href="https://sdk.mystenlabs.com/dapp-kit"
								target="_blank"
								rel="noreferrer"
								visibleFrom="xs"
								rightSection={<IconExternalLink size={16} />}
							>
								Sui dApp Kit docs
							</Button>
						</Group>
					</Stack>
				</Card>

				<Divider />

				<SimpleGrid cols={{ base: 1, sm: 3 }}>
					<Card withBorder radius="lg" p="lg">
						<Group justify="space-between" align="flex-start">
							<Stack gap={2}>
								<Text fw={700}>Learn</Text>
								<Text size="sm" c="dimmed">
									Browse and enroll in on-chain courses.
								</Text>
							</Stack>
							<ThemeIcon variant="light" radius="xl" size={36}>
								<IconBookOpen size={18} />
							</ThemeIcon>
						</Group>
					</Card>
					<Card withBorder radius="lg" p="lg">
						<Group justify="space-between" align="flex-start">
							<Stack gap={2}>
								<Text fw={700}>Earn</Text>
								<Text size="sm" c="dimmed">
									Get verifiable credentials as owned certificates.
								</Text>
							</Stack>
							<ThemeIcon variant="light" radius="xl" size={36}>
								<IconAward size={18} />
							</ThemeIcon>
						</Group>
					</Card>
					<Card withBorder radius="lg" p="lg">
						<Group justify="space-between" align="flex-start">
							<Stack gap={2}>
								<Text fw={700}>Participate</Text>
								<Text size="sm" c="dimmed">
									Vote on proposals and build civic points.
								</Text>
							</Stack>
							<ThemeIcon variant="light" radius="xl" size={36}>
								<IconThumbsUp size={18} />
							</ThemeIcon>
						</Group>
					</Card>
				</SimpleGrid>

				<Text size="sm" c="dimmed">
					Tip: set your package and shared object IDs in <code>.env.local</code>.
				</Text>
			</Stack>
		</Container>
	)
}
