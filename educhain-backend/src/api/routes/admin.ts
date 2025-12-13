import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { getSuiClient } from '../../sui/client.js';
import { getAdminKeypairOrNull } from '../../sui/adminSigner.js';
import { Transaction } from '@mysten/sui/transactions';
import { CONFIG } from '../../config.js';

/**
 * DEMO ONLY
 * These endpoints sign transactions server-side (ADMIN_PRIVATE_KEY).
 * In production, admins should submit transactions using wallets/multisig.
 */

const CreateCourseBody = z.object({
  title: z.string().min(1),
  contentUri: z.string().min(1),
});

const CreateProposalBody = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

function preconditionFailed(reply: any, message: string) {
  return reply.code(412).send({ error: message });
}

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.post('/create-course', {
    schema: { description: 'Create a course (requires TeacherCap + CourseCatalog shared object)' },
  }, async (req, reply) => {
    const signer = getAdminKeypairOrNull();
    if (!signer) return preconditionFailed(reply, 'ADMIN_PRIVATE_KEY not set');

    if (!CONFIG.SUI_TEACHER_CAP_ID) return preconditionFailed(reply, 'SUI_TEACHER_CAP_ID not set');
    if (!CONFIG.SUI_COURSE_CATALOG_ID) return preconditionFailed(reply, 'SUI_COURSE_CATALOG_ID not set');

    const body = CreateCourseBody.parse(req.body);
    const client = getSuiClient();

    const tx = new Transaction();
    tx.moveCall({
      target: `${CONFIG.SUI_PACKAGE_ID}::educhain::create_course`,
      arguments: [
        tx.object(CONFIG.SUI_TEACHER_CAP_ID),
        tx.object(CONFIG.SUI_COURSE_CATALOG_ID),
        tx.pure.string(body.title),
        tx.pure.string(body.contentUri),
      ],
    });

    const result = await client.signAndExecuteTransaction({
      signer,
      transaction: tx,
      options: { showEffects: true, showEvents: true },
    });

    return { digest: result.digest, effects: result.effects, events: result.events };
  });

  app.post('/create-proposal', {
    schema: { description: 'Create a proposal (requires AdminCap + ProposalRegistry shared object)' },
  }, async (req, reply) => {
    const signer = getAdminKeypairOrNull();
    if (!signer) return preconditionFailed(reply, 'ADMIN_PRIVATE_KEY not set');

    if (!CONFIG.SUI_ADMIN_CAP_ID) return preconditionFailed(reply, 'SUI_ADMIN_CAP_ID not set');
    if (!CONFIG.SUI_PROPOSAL_REGISTRY_ID) return preconditionFailed(reply, 'SUI_PROPOSAL_REGISTRY_ID not set');

    const body = CreateProposalBody.parse(req.body);
    const client = getSuiClient();

    const tx = new Transaction();
    tx.moveCall({
      target: `${CONFIG.SUI_PACKAGE_ID}::educhain::create_proposal`,
      arguments: [
        tx.object(CONFIG.SUI_ADMIN_CAP_ID),
        tx.object(CONFIG.SUI_PROPOSAL_REGISTRY_ID),
        tx.pure.string(body.title),
        tx.pure.string(body.description),
      ],
    });

    const result = await client.signAndExecuteTransaction({
      signer,
      transaction: tx,
      options: { showEffects: true, showEvents: true },
    });

    return { digest: result.digest, effects: result.effects, events: result.events };
  });
};
