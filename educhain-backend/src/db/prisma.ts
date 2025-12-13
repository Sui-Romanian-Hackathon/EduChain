/**
 * Prisma 7 supports multiple "engine types".
 *
 * If an environment (shell / CI) sets `PRISMA_CLIENT_ENGINE_TYPE=client`,
 * Prisma requires a driver adapter or Accelerate URL and will crash at runtime:
 * "Using engine type \"client\" requires either \"adapter\" or \"accelerateUrl\"..."
 *
 * This project uses a normal Postgres connection string (`DATABASE_URL`),
 * so we force the standard engine to keep local dev simple.
 */
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary';

const { PrismaClient } = await import('@prisma/client');

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
