'use client';

import { Card, Text, Title, Group, Stack, Button, SimpleGrid, Code, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { useProfile } from '@/lib/useProfile';
import { APP_CONFIG, shortAddress, suiChainId } from '@/lib/config';
import { buildCreateProfileTx } from '@/lib/sui';

export function ProfilePanel() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { profile, refetch, isPending } = useProfile();
  const { mutate: signAndExecuteTransaction, isPending: txPending } = useSignAndExecuteTransaction();

  const onCreateProfile = async () => {
    try {
      const tx = await buildCreateProfileTx(client as any);
      signAndExecuteTransaction(
        { transaction: tx as any, chain: suiChainId(APP_CONFIG.network) },
        {
          onSuccess: (res) => notifications.show({ title: 'Profile created', message: `Tx: ${res.digest}` }),
          onError: (e) => notifications.show({ color: 'red', title: 'Transaction failed', message: e.message }),
        },
      );
    } catch (e: any) {
      notifications.show({ color: 'red', title: 'Error', message: e.message ?? 'Unknown error' });
    }
  };

  return (
    <Stack gap="md">
      <Stack gap="md">
        <Stack gap={0}>
          <Title order={2}>Profile</Title>
          <Text size="sm" c="dimmed">
            Owned object that tracks your learning + civic achievements.
          </Text>
        </Stack>

        <Group visibleFrom="sm">
          <Button variant="light" onClick={() => refetch()} loading={isPending} disabled={!account}>
            Refresh
          </Button>
          {!profile && (
            <Button onClick={onCreateProfile} loading={txPending} disabled={!account}>
              Create Profile
            </Button>
          )}
        </Group>
        <Stack gap="xs" hiddenFrom="sm">
          <Button variant="light" onClick={() => refetch()} loading={isPending} disabled={!account} fullWidth>
            Refresh
          </Button>
          {!profile && (
            <Button onClick={onCreateProfile} loading={txPending} disabled={!account} fullWidth>
              Create Profile
            </Button>
          )}
        </Stack>
      </Stack>

      <Card withBorder radius="lg" p="lg">
        <Stack gap="sm">
          <Group justify="space-between">
            <Text fw={600}>Wallet</Text>
            <Code>{account?.address ? shortAddress(account.address) : 'Not connected'}</Code>
          </Group>

          <Divider />

          {!profile ? (
            <Text c="dimmed" size="sm">
              No Profile found for this wallet yet.
            </Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Card withBorder radius="lg" p="md">
                <Text c="dimmed" size="sm">
                  Education points
                </Text>
                <Title order={3}>{profile.eduPoints}</Title>
              </Card>

              <Card withBorder radius="lg" p="md">
                <Text c="dimmed" size="sm">
                  Civic points
                </Text>
                <Title order={3}>{profile.civicPoints}</Title>
              </Card>

              <Card withBorder radius="lg" p="md">
                <Text c="dimmed" size="sm">
                  Completed courses
                </Text>
                <Text>{profile.completedCourses.length ? profile.completedCourses.join(', ') : '—'}</Text>
              </Card>

              <Card withBorder radius="lg" p="md">
                <Text c="dimmed" size="sm">
                  Voted proposals
                </Text>
                <Text>{profile.votedProposals.length ? profile.votedProposals.join(', ') : '—'}</Text>
              </Card>

              <Card withBorder radius="lg" p="md" style={{ gridColumn: '1 / -1' }}>
                <Text c="dimmed" size="sm">
                  Profile object id
                </Text>
                <Code>{profile.objectId}</Code>
              </Card>
            </SimpleGrid>
          )}
        </Stack>
      </Card>

      <Text size="xs" c="dimmed">
        Using chain: sui:{APP_CONFIG.network}
      </Text>
    </Stack>
  );
}
