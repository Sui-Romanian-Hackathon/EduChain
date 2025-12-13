import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';

const QuerySchema = z.object({
  limit: z.coerce.number().min(1).max(500).default(50),
  cursor: z.coerce.bigint().optional(), // DB id cursor for pagination (desc order)
  eventType: z.string().min(1).optional(),
  sender: z.string().min(1).optional(),
  packageId: z.string().min(1).optional(),
  module: z.string().min(1).optional(),
});

export const eventsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', {
    schema: {
      description: 'List indexed Sui events stored in Postgres',
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50, minimum: 1, maximum: 500 },
          cursor: { type: 'string', description: 'DB cursor (id). Use nextCursor from prior response.' },
          eventType: { type: 'string' },
          sender: { type: 'string' },
          packageId: { type: 'string' },
          module: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { type: 'object' } },
            nextCursor: { anyOf: [{ type: 'string' }, { type: 'null' }] },
          },
        },
      },
    },
  }, async (req) => {
    const q = QuerySchema.parse(req.query);

    const where: any = {};
    if (q.eventType) where.eventType = q.eventType;
    if (q.sender) where.sender = q.sender;
    if (q.packageId) where.packageId = q.packageId;
    if (q.module) where.transactionModule = q.module;

    const rows = await prisma.suiEvent.findMany({
      where,
      take: q.limit,
      ...(q.cursor ? { skip: 1, cursor: { id: q.cursor } } : {}),
      orderBy: { id: 'desc' },
    });

    const nextCursor = rows.length > 0 ? rows[rows.length - 1].id : null;
    return { data: rows, nextCursor: nextCursor ? String(nextCursor) : null };
  });
};
