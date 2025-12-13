import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import { CONFIG } from '../config.js';
import { swaggerPlugin } from './plugins/swagger.js';
import { healthRoutes } from './routes/health.js';
import { eventsRoutes } from './routes/events.js';
import { adminRoutes } from './routes/admin.js';

const app = Fastify({
  logger: {
    level: CONFIG.LOG_LEVEL,
    transport: CONFIG.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { translateTime: 'SYS:standard' } }
      : undefined,
  },
});

await app.register(helmet);
await app.register(cors, { origin: true });
await app.register(rateLimit, { max: 120, timeWindow: '1 minute' });

await swaggerPlugin(app);

await app.register(healthRoutes);
await app.register(eventsRoutes, { prefix: '/events' });
await app.register(adminRoutes, { prefix: '/admin' });

app.get('/', async () => ({
  name: 'educhain-backend',
  env: CONFIG.NODE_ENV,
}));

app.listen({ port: CONFIG.PORT, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
