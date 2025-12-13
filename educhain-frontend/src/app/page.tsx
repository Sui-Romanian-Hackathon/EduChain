import Link from 'next/link';
import { Container, Title, Text, Button, Group, Card, Stack } from '@mantine/core';

export default function HomePage() {
  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1}>EduCityChain</Title>
        <Text c="dimmed">
          A Sui-powered platform that issues verifiable educational credentials and supports civic engagement
          (volunteering, proposals, participatory budgeting).
        </Text>

        <Card withBorder radius="lg" p="lg">
          <Stack>
            <Title order={3}>Start</Title>
            <Text c="dimmed">
              Connect your wallet and create your on-chain Profile. Then enroll in courses, earn credentials, and vote
              on proposals.
            </Text>
            <Group wrap="wrap">
              <Button component={Link} href="/dashboard" fullWidth hiddenFrom="xs">
                Open dashboard
              </Button>
              <Button component={Link} href="/dashboard" visibleFrom="xs">
                Open dashboard
              </Button>
              <Button component="a" variant="light" href="https://sdk.mystenlabs.com/dapp-kit" target="_blank" rel="noreferrer" fullWidth hiddenFrom="xs">
                Sui dApp Kit docs
              </Button>
              <Button component="a" variant="light" href="https://sdk.mystenlabs.com/dapp-kit" target="_blank" rel="noreferrer" visibleFrom="xs">
                Sui dApp Kit docs
              </Button>
            </Group>
          </Stack>
        </Card>

        <Text size="sm" c="dimmed">
          Tip: set your package and shared object IDs in <code>.env.local</code>.
        </Text>
      </Stack>
    </Container>
  );
}
