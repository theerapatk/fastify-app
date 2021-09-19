import fastify, {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
} from 'fastify';
import authRouters from './routers/auth.router';

const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  reply.log.warn(error.message);
  reply.status(error.statusCode || 500).send({
    error: {
      message: error.message,
      code: error.code,
    },
  });
};

const swaggerOption = {
  exposeRoute: true,
  routePrefix: '/documentation',
  swagger: {
    info: { title: 'fastify-api' },
  },
};

const buildApp = (options: FastifyServerOptions): FastifyInstance => {
  const app = fastify(options);
  app.get('/', async () => 'OK');
  app.register(require('fastify-swagger'), swaggerOption);
  app.register(authRouters, { prefix: 'api/v1/auth' });
  app.setErrorHandler(errorHandler);
  return app;
};

export default buildApp;
