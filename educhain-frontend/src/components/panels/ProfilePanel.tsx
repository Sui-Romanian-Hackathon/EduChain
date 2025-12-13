'use client';

import { Card, Text, Title, Group, Stack, Button, SimpleGrid, Code, Divider, Anchor } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { useProfile } from '@/lib/useProfile';
import { useEnrollments } from '@/lib/useEnrollments';
import { useCourses } from '@/lib/useCourses';
import { useResults } from '@/lib/useResults';
import { useCertificates } from '@/lib/useCertificates';
import { useVotes } from '@/lib/useVotes';
import { useProposals } from '@/lib/useProposals';
import { APP_CONFIG, shortAddress, suiChainId } from '@/lib/config';
import { buildCreateProfileTx } from '@/lib/sui';

export function ProfilePanel() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { profile, refetch, isPending } = useProfile();
  const { enrollments } = useEnrollments(200);
  const { completedCourseIds, resultByCourseId } = useResults(500);
  const { courses } = useCourses(200);
  const { certificates } = useCertificates(50);
  const { votedProposalIds, votedChoiceByProposalId } = useVotes(500);
  const { proposals } = useProposals(200);
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
                <Text>
                  {enrollments.filter((e) => completedCourseIds.has(e.courseId)).length
                    ? enrollments
                        .filter((e) => completedCourseIds.has(e.courseId))
                        .map((e) => {
                          const course = courses.find((c) => c.id === e.courseId);
                          const score = resultByCourseId.get(e.courseId)?.score;
                          const scoreLabel = score != null ? ` — score ${score}` : '';
                          return course?.title
                            ? `${course.title} (#${e.courseId})${scoreLabel}`
                            : `#${e.courseId}${scoreLabel}`;
                        })
                        .join(', ')
                    : '—'}
                </Text>
              </Card>

              <Card withBorder radius="lg" p="md">
                <Text c="dimmed" size="sm">
                  Enrolled courses
                </Text>
                <Text>
                  {enrollments.length
                    ? enrollments
                        .map((e) => {
                          const course = courses.find((c) => c.id === e.courseId);
                          const done = completedCourseIds.has(e.courseId);
                          const score = done ? resultByCourseId.get(e.courseId)?.score : undefined;
                          const suffix = done ? ` ✅${score != null ? ` (${score})` : ''}` : '';
                          return course?.title ? `${course.title} (#${e.courseId})${suffix}` : `#${e.courseId}${suffix}`;
                        })
                        .join(', ')
                    : '—'}
                </Text>
              </Card>

              <Card withBorder radius="lg" p="md">
                <Text c="dimmed" size="sm">
                  Voted proposals
                </Text>
                <Text>
                  {votedProposalIds.size
                    ? [...votedProposalIds]
                        .sort((a, b) => a - b)
                        .map((id) => {
                          const title = proposals.find((p) => p.id === id)?.title ?? `#${id}`;
                          const choice = votedChoiceByProposalId.get(id);
                          const choiceLabel = choice === 0 ? 'No' : 'Yes';
                          return `${title} (${choiceLabel})`;
                        })
                        .join(', ')
                    : '—'}
                </Text>
              </Card>

              <Card withBorder radius="lg" p="md" style={{ gridColumn: '1 / -1' }}>
                <Text c="dimmed" size="sm">
                  Certificates (owned)
                </Text>
                {certificates.length ? (
                  <Stack gap={6} mt={6}>
                    {certificates.map((c) => {
                      const course = courses.find((x) => x.id === c.courseId);
                      return (
                        <Group key={c.objectId} justify="space-between" align="flex-start" wrap="nowrap">
                          <Stack gap={2} style={{ minWidth: 0 }}>
                            <Text size="sm" fw={600} lineClamp={1}>
                              {course?.title ? `${course.title} (#${c.courseId})` : `Course #${c.courseId}`}
                            </Text>
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              Score: <b>{c.score}</b> • Object: <Code>{c.objectId}</Code>
                            </Text>
                          </Stack>
                          <Stack gap={2} align="flex-end">
                            <Anchor href={`/api/certificates/${c.objectId}`} target="_blank" rel="noreferrer" size="xs">
                              Hosted metadata
                            </Anchor>
                            {c.metadataUri ? (
                              <Anchor href={c.metadataUri} target="_blank" rel="noreferrer" size="xs" c="dimmed">
                                On-chain metadata_uri
                              </Anchor>
                            ) : null}
                          </Stack>
                        </Group>
                      );
                    })}
                  </Stack>
                ) : (
                  <Text size="sm">—</Text>
                )}
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
