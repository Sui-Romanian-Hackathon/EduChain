'use client';

import { useEffect, useState } from 'react';
import { Alert, Code, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { requiredConfigMissing } from '@/lib/config';

export function ConfigAlert() {
  const [mounted, setMounted] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    setMissing(requiredConfigMissing());
  }, []);

  // Don't render on server to avoid hydration mismatch
  if (!mounted) return null;
  if (missing.length === 0) return null;

  return (
    <Alert icon={<IconAlertTriangle size={18} />} title="Missing configuration" color="yellow" radius="lg">
      <Stack gap="xs">
        <Text size="sm">
          Add these variables to <Code>educhain-frontend/.env.local</Code> (template: <Code>env.example</Code>) and restart{' '}
          <Code>npm run dev</Code>:
        </Text>
        <Text size="sm">
          {missing.map((k) => (
            <Code key={k} mr="xs">
              {k}
            </Code>
          ))}
        </Text>
      </Stack>
    </Alert>
  );
}
