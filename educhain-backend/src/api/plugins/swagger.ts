import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

export async function swaggerPlugin(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      info: { title: 'EduCityChain API', version: '0.1.0' },
    },
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
  });
}
