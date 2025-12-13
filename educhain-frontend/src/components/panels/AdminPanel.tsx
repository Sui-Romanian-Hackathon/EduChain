'use client';

import { useState } from 'react';
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { APP_CONFIG, suiChainId } from '@/lib/config';
import { buildCreateCourseTx, buildCreateProposalTx, buildIssueCertificateTx } from '@/lib/sui';
import { useCaps } from '@/lib/useCaps';

export function AdminPanel() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { caps } = useCaps();
  const { mutate: signAndExecuteTransaction, isPending: txPending } = useSignAndExecuteTransaction();

  const [courseTitle, setCourseTitle] = useState('');
  const [courseUri, setCourseUri] = useState('');

  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');
  const [proposalBudget, setProposalBudget] = useState<number>(100);

  const [certCourseId, setCertCourseId] = useState<number>(1);
  const [certStudent, setCertStudent] = useState('');
  const [certMetadataUri, setCertMetadataUri] = useState('ipfs://... or https://...');

  const createCourse = async () => {
    if (!APP_CONFIG.packageId || !APP_CONFIG.courseCatalogId) {
      notifications.show({
        color: 'red',
        title: 'Missing configuration',
        message: 'Set NEXT_PUBLIC_SUI_PACKAGE_ID and NEXT_PUBLIC_COURSE_CATALOG_ID in educhain-frontend/.env.local and restart.',
      });
      return;
    }
    if (!caps.teacherCapId) {
      notifications.show({ color: 'yellow', title: 'Missing TeacherCap', message: 'This wallet has no TeacherCap.' });
      return;
    }
    try {
      const tx = await buildCreateCourseTx(client as any, {
        teacherCapId: caps.teacherCapId,
        title: courseTitle || 'Untitled course',
        contentUri: courseUri || 'ipfs://... or https://...',
      });
      signAndExecuteTransaction(
        { transaction: tx as any, chain: suiChainId(APP_CONFIG.network) },
        {
          onSuccess: (res) => notifications.show({ title: 'Course created', message: `Tx: ${res.digest}` }),
          onError: (e) => notifications.show({ color: 'red', title: 'Transaction failed', message: e.message }),
        },
      );
    } catch (e: any) {
      notifications.show({ color: 'red', title: 'Error', message: e.message ?? 'Unknown error' });
    }
  };

  const createProposal = async () => {
    if (!APP_CONFIG.packageId || !APP_CONFIG.proposalRegistryId) {
      notifications.show({
        color: 'red',
        title: 'Missing configuration',
        message:
          'Set NEXT_PUBLIC_SUI_PACKAGE_ID and NEXT_PUBLIC_PROPOSAL_REGISTRY_ID in educhain-frontend/.env.local and restart.',
      });
      return;
    }
    if (!caps.adminCapId) {
      notifications.show({ color: 'yellow', title: 'Missing AdminCap', message: 'This wallet has no AdminCap.' });
      return;
    }
    try {
      const tx = await buildCreateProposalTx(client as any, {
        adminCapId: caps.adminCapId,
        title: proposalTitle || 'Untitled proposal',
        description: proposalDesc || 'Description…',
        budget: proposalBudget ?? 0,
      });
      signAndExecuteTransaction(
        { transaction: tx as any, chain: suiChainId(APP_CONFIG.network) },
        {
          onSuccess: (res) => notifications.show({ title: 'Proposal created', message: `Tx: ${res.digest}` }),
          onError: (e) => notifications.show({ color: 'red', title: 'Transaction failed', message: e.message }),
        },
      );
    } catch (e: any) {
      notifications.show({ color: 'red', title: 'Error', message: e.message ?? 'Unknown error' });
    }
  };

  const issueCertificate = async () => {
    if (!APP_CONFIG.packageId || !APP_CONFIG.courseCatalogId) {
      notifications.show({
        color: 'red',
        title: 'Missing configuration',
        message: 'Set NEXT_PUBLIC_SUI_PACKAGE_ID and NEXT_PUBLIC_COURSE_CATALOG_ID in educhain-frontend/.env.local and restart.',
      });
      return;
    }
    if (!caps.issuerCapId) {
      notifications.show({ color: 'yellow', title: 'Missing IssuerCap', message: 'This wallet has no IssuerCap.' });
      return;
    }

    const student = certStudent.trim();
    if (!student || !student.startsWith('0x')) {
      notifications.show({ color: 'yellow', title: 'Invalid student address', message: 'Enter a valid Sui address.' });
      return;
    }

    try {
      const tx = await buildIssueCertificateTx(client as any, {
        issuerCapId: caps.issuerCapId,
        courseId: certCourseId ?? 0,
        student,
        metadataUri: certMetadataUri || 'ipfs://... or https://...',
      });
      signAndExecuteTransaction(
        { transaction: tx as any, chain: suiChainId(APP_CONFIG.network) },
        {
          onSuccess: (res) => notifications.show({ title: 'Certificate issued', message: `Tx: ${res.digest}` }),
          onError: (e) => notifications.show({ color: 'red', title: 'Transaction failed', message: e.message }),
        },
      );
    } catch (e: any) {
      notifications.show({ color: 'red', title: 'Error', message: e.message ?? 'Unknown error' });
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end">
        <Stack gap={0}>
          <Title order={2}>Admin</Title>
          <Text size="sm" c="dimmed">
            If your wallet owns capability objects, you can publish courses and create proposals.
          </Text>
        </Stack>
      </Group>

      <Alert icon={<IconInfoCircle size={18} />} title="Capabilities" radius="lg">
        <Stack gap={4}>
          <Text size="sm">
            TeacherCap: <Code>{caps.teacherCapId ?? '—'}</Code>
          </Text>
          <Text size="sm">
            AdminCap: <Code>{caps.adminCapId ?? '—'}</Code>
          </Text>
          <Text size="sm">
            IssuerCap: <Code>{caps.issuerCapId ?? '—'}</Code>
          </Text>
        </Stack>
      </Alert>

      <Card withBorder radius="lg" p="lg">
        <Title order={4}>Create course</Title>
        <Stack mt="sm">
          <TextInput label="Title" value={courseTitle} onChange={(e) => setCourseTitle(e.currentTarget.value)} />
          <TextInput
            label="Content URI"
            description="A link to the course module: IPFS / Arweave / HTTPS"
            value={courseUri}
            onChange={(e) => setCourseUri(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button onClick={createCourse} loading={txPending} disabled={!account}>
              Create course
            </Button>
          </Group>
        </Stack>
      </Card>

      <Card withBorder radius="lg" p="lg">
        <Title order={4}>Issue certificate</Title>
        <Text size="sm" c="dimmed" mt={4}>
          Mints an owned Certificate object to the student address (requires the student to have completed the course).
        </Text>
        <Stack mt="sm">
          <NumberInput label="Course id" value={certCourseId} onChange={(v) => setCertCourseId(Number(v))} min={0} />
          <TextInput
            label="Student address"
            placeholder="0x..."
            value={certStudent}
            onChange={(e) => setCertStudent(e.currentTarget.value)}
          />
          <TextInput
            label="Metadata URI"
            description="Where the certificate metadata lives (IPFS / Arweave / HTTPS)"
            value={certMetadataUri}
            onChange={(e) => setCertMetadataUri(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button onClick={issueCertificate} loading={txPending} disabled={!account}>
              Issue certificate
            </Button>
          </Group>
        </Stack>
      </Card>

      <Card withBorder radius="lg" p="lg">
        <Title order={4}>Create proposal</Title>
        <Stack mt="sm">
          <TextInput label="Title" value={proposalTitle} onChange={(e) => setProposalTitle(e.currentTarget.value)} />
          <Textarea
            label="Description"
            minRows={3}
            value={proposalDesc}
            onChange={(e) => setProposalDesc(e.currentTarget.value)}
          />
          <NumberInput
            label="Budget"
            value={proposalBudget}
            onChange={(v) => setProposalBudget(Number(v))}
            min={0}
          />
          <Group justify="flex-end">
            <Button onClick={createProposal} loading={txPending} disabled={!account}>
              Create proposal
            </Button>
          </Group>
        </Stack>
      </Card>

      <Text size="xs" c="dimmed">
        Using chain: sui:{APP_CONFIG.network}
      </Text>
    </Stack>
  );
}
