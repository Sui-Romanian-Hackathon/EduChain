'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, Text, Title, SimpleGrid, Button, Group, Stack, Skeleton, Badge, Progress, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { useProposals } from '@/lib/useProposals';
import { useProfile } from '@/lib/useProfile';
import { useVotes } from '@/lib/useVotes';
import { APP_CONFIG, suiChainId } from '@/lib/config';
import { buildCreateProfileTx, buildVoteTx } from '@/lib/sui';

export function ProposalsPanel() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { profile } = useProfile();
  const { proposals, loading, source } = useProposals(50);
  const { votedProposalIds, refetch: refetchVotes } = useVotes(500);

  const { mutate: signAndExecuteTransaction, isPending: txPending } = useSignAndExecuteTransaction();
  const [filter, setFilter] = useState('');
  const [optimisticVoted, setOptimisticVoted] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Reset optimistic state when wallet changes
    setOptimisticVoted(new Set());
  }, [account?.address]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return proposals;
    return proposals.filter((p) => (p.title ?? '').toLowerCase().includes(q));
  }, [proposals, filter]);

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

  const onVote = async (proposalId: number, choice: 0 | 1) => {
    if (!profile) {
      notifications.show({ color: 'yellow', title: 'No Profile', message: 'Create your Profile first.' });
      return;
    }
    try {
      const tx = await buildVoteTx(client as any, { profileId: profile.objectId, proposalId, choice });
      signAndExecuteTransaction(
        { transaction: tx as any, chain: suiChainId(APP_CONFIG.network) },
        {
          onSuccess: (res) => {
            setOptimisticVoted((prev) => {
              const next = new Set(prev);
              next.add(proposalId);
              return next;
            });
            // Best-effort refresh VoteCast events so UI stays consistent after navigation.
            refetchVotes();
            notifications.show({ title: 'Vote submitted', message: `Tx: ${res.digest}` });
          },
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
          <Title order={2}>Proposals</Title>
          <Text size="sm" c="dimmed">
            Vote on on-chain proposals (writes to shared registry + your owned Profile).
          </Text>
        </Stack>

        {!profile && (
          <Group>
            <Button onClick={onCreateProfile} loading={txPending} disabled={!account} visibleFrom="sm">
              Create Profile
            </Button>
            <Button onClick={onCreateProfile} loading={txPending} disabled={!account} fullWidth hiddenFrom="sm">
              Create Profile
            </Button>
          </Group>
        )}
      </Stack>

      <TextInput
        placeholder="Search proposals…"
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
      />

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
          {filtered.map((p) => {
            const voted = votedProposalIds.has(p.id) || optimisticVoted.has(p.id);
            const yes = p.yesVotes ?? 0;
            const no = p.noVotes ?? 0;
            const total = Math.max(1, yes + no);
            const yesPct = Math.round((yes / total) * 100);

            return (
              <Card key={p.objectId} withBorder radius="lg" p="lg">
                <Stack gap="xs">
                  <Group justify="space-between" align="flex-start">
                    <Title order={4}>{p.title ?? `Proposal #${p.id}`}</Title>
                    <Badge variant="light">#{p.id}</Badge>
                  </Group>

                  {p.description && (
                    <Text size="sm" c="dimmed" lineClamp={3}>
                      {p.description}
                    </Text>
                  )}

                  <Group justify="space-between" mt="xs">
                    <Text size="sm" c="dimmed">
                      Votes
                    </Text>
                    <Badge color={voted ? 'green' : 'gray'} variant="light">
                      {voted ? 'Voted' : 'Not voted'}
                    </Badge>
                  </Group>

                  <Progress value={yesPct} mt="xs" />

                  <Group justify="space-between" mt="sm">
                    <Text size="xs" c="dimmed">
                      Yes {yes} / No {no}
                    </Text>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        disabled={!profile || voted}
                        loading={txPending}
                        onClick={() => onVote(p.id, 0)}
                      >
                        No
                      </Button>
                      <Button
                        size="xs"
                        disabled={!profile || voted}
                        loading={txPending}
                        onClick={() => onVote(p.id, 1)}
                      >
                        Yes
                      </Button>
                    </Group>
                  </Group>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>
      )}

      <Text size="xs" c="dimmed">
        Using chain: sui:{APP_CONFIG.network} (data source: {source})
      </Text>
    </Stack>
  );
}
