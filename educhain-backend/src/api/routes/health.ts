import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '../../db/prisma.js';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', {
    schema: {
      description: 'Health check (API + DB connectivity)',
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            db: { type: 'boolean' },
          },
        },
      },
    },
  }, async () => {
    let db = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      db = true;
    } catch {
      db = false;
    }
    return { ok: true, db };
  });
};
