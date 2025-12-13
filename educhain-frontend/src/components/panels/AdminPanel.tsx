'use client';

import { useEffect, useMemo, useState } from 'react';
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient, useSuiClientQuery } from '@mysten/dapp-kit';
import { APP_CONFIG, suiChainId } from '@/lib/config';
import { buildCreateCourseTx, buildCreateProposalTx, buildIssueCertificateTx, buildSubmitResultTx, structType } from '@/lib/sui';
import { useCaps } from '@/lib/useCaps';
import { useCourses } from '@/lib/useCourses';

export function AdminPanel() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { caps } = useCaps();
  const { courses } = useCourses(200);
  const { mutate: signAndExecuteTransaction, isPending: txPending } = useSignAndExecuteTransaction();

  const initializedEventType = useMemo(
    () => (APP_CONFIG.packageId ? structType('educhain', 'Initialized') : ''),
    [],
  );
  const initialized = useSuiClientQuery(
    'queryEvents',
    {
      query: { MoveEventType: initializedEventType },
      limit: 1,
      order: 'descending',
    },
    { enabled: Boolean(APP_CONFIG.packageId && initializedEventType) },
  );

  const initInfo = useMemo(() => {
    const evt: any = initialized.data?.data?.[0];
    const pj = evt?.parsedJson ?? null;
    if (!pj || typeof pj !== 'object') return null;
    return {
      publisher: pj.publisher ? String(pj.publisher) : null,
      courseCatalogId: pj.course_catalog_id ? String(pj.course_catalog_id) : null,
      proposalRegistryId: pj.proposal_registry_id ? String(pj.proposal_registry_id) : null,
      teacherCapId: pj.teacher_cap_id ? String(pj.teacher_cap_id) : null,
      adminCapId: pj.admin_cap_id ? String(pj.admin_cap_id) : null,
      issuerCapId: pj.issuer_cap_id ? String(pj.issuer_cap_id) : null,
    };
  }, [initialized.data]);

  const [courseTitle, setCourseTitle] = useState('');
  const [courseUri, setCourseUri] = useState('');

  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');

  const [resultCourseId, setResultCourseId] = useState<string>('');
  const [resultStudent, setResultStudent] = useState('');
  const [resultScore, setResultScore] = useState<number>(100);

  const [certCourseId, setCertCourseId] = useState<string>('');
  const [certStudent, setCertStudent] = useState('');
  const [certMetadataUri, setCertMetadataUri] = useState('');

  const courseOptions = useMemo(
    () =>
      courses.map((c) => ({
        value: String(c.id),
        label: `${c.title ?? `Course #${c.id}`} (#${c.id})`,
      })),
    [courses],
  );

  // Auto-select first course once loaded (only if nothing selected yet)
  useEffect(() => {
    if (!resultCourseId && courseOptions.length) setResultCourseId(courseOptions[0].value);
  }, [courseOptions, resultCourseId]);
  useEffect(() => {
    if (!certCourseId && courseOptions.length) setCertCourseId(courseOptions[0].value);
  }, [courseOptions, certCourseId]);

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

  const submitResult = async () => {
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

    const student = resultStudent.trim();
    if (!student || !student.startsWith('0x')) {
      notifications.show({ color: 'yellow', title: 'Invalid student address', message: 'Enter a valid Sui address.' });
      return;
    }
    if (!resultCourseId) {
      notifications.show({ color: 'yellow', title: 'Select a course', message: 'Pick a course from the dropdown.' });
      return;
    }

    try {
      const tx = await buildSubmitResultTx(client as any, {
        teacherCapId: caps.teacherCapId,
        courseId: resultCourseId,
        student,
        completed: true,
        score: resultScore ?? 0,
      });
      signAndExecuteTransaction(
        { transaction: tx as any, chain: suiChainId(APP_CONFIG.network) },
        {
          onSuccess: (res) => notifications.show({ title: 'Result submitted', message: `Tx: ${res.digest}` }),
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
    if (!certCourseId) {
      notifications.show({ color: 'yellow', title: 'Select a course', message: 'Pick a course from the dropdown.' });
      return;
    }

    try {
      const tx = await buildIssueCertificateTx(client as any, {
        issuerCapId: caps.issuerCapId,
        courseId: certCourseId,
        student,
        metadataUri: certMetadataUri || '',
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

      <Alert icon={<IconInfoCircle size={18} />} title="init_state (Initialized event)" radius="lg">
        {!APP_CONFIG.packageId ? (
          <Text size="sm">Set <Code>NEXT_PUBLIC_SUI_PACKAGE_ID</Code> to enable chain lookup.</Text>
        ) : initialized.isPending ? (
          <Text size="sm">Loading latest Initialized event from chain…</Text>
        ) : !initInfo ? (
          <Text size="sm" c="dimmed">
            No Initialized event found for this package on {APP_CONFIG.network}. That usually means <Code>init_state</Code>{' '}
            hasn’t been called yet (or you’re on the wrong network).
          </Text>
        ) : (
          <Stack gap={6}>
            <Text size="sm">
              Publisher (received caps): <Code>{initInfo.publisher ?? '—'}</Code>
            </Text>
            {account?.address && initInfo.publisher && account.address !== initInfo.publisher && (
              <Text size="sm" c="yellow">
                Your connected wallet (<Code>{account.address}</Code>) is different from the publisher above, so it won’t have the caps unless they were
                transferred to you.
              </Text>
            )}
            <Text size="sm">
              TeacherCap id: <Code>{initInfo.teacherCapId ?? '—'}</Code>
            </Text>
            <Text size="sm">
              AdminCap id: <Code>{initInfo.adminCapId ?? '—'}</Code>
            </Text>
            <Text size="sm">
              IssuerCap id: <Code>{initInfo.issuerCapId ?? '—'}</Code>
            </Text>
          </Stack>
        )}
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
        <Title order={4}>Mark course completed (submit result)</Title>
        <Text size="sm" c="dimmed" mt={4}>
          Teacher-only. This sets the student’s enrollment to <b>completed</b> and records a score. Required before issuing a certificate.
        </Text>
        <Stack mt="sm">
          <Select
            label="Course"
            placeholder={courseOptions.length ? 'Select a course…' : 'No courses found yet'}
            data={courseOptions}
            value={resultCourseId}
            onChange={(v) => setResultCourseId(v ?? '')}
            searchable
            nothingFoundMessage="No matching courses"
            disabled={!courseOptions.length}
          />
          <TextInput
            label="Student address"
            placeholder="0x..."
            value={resultStudent}
            onChange={(e) => setResultStudent(e.currentTarget.value)}
          />
          <NumberInput label="Score" value={resultScore} onChange={(v) => setResultScore(Number(v))} min={0} />
          <Group justify="flex-end">
            <Button onClick={submitResult} loading={txPending} disabled={!account}>
              Submit result
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
          <Select
            label="Course"
            placeholder={courseOptions.length ? 'Select a course…' : 'No courses found yet'}
            data={courseOptions}
            value={certCourseId}
            onChange={(v) => setCertCourseId(v ?? '')}
            searchable
            nothingFoundMessage="No matching courses"
            disabled={!courseOptions.length}
          />
          <TextInput
            label="Student address"
            placeholder="0x..."
            value={certStudent}
            onChange={(e) => setCertStudent(e.currentTarget.value)}
          />
          <TextInput
            label="Metadata URI"
            description='Optional. You can leave this blank and use the "Hosted metadata" link shown on Profile after mint.'
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
