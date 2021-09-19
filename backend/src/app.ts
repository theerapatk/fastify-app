import fastify, {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
} from 'fastify';
import authRouters from './routers/auth';

const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  reply.log.warn(error.message);
  reply.status(reply.statusCode || 500).send({
    error: {
      message: error.message,
    },
  });
};

const swaggerOption = {
  exposeRoute: true,
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'fastify-app api',
      description: 'The fastify-app swagger api',
      version: '0.1.0',
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here',
    },
    host: 'localhost',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [{ name: 'auth', description: 'Authentication related end-points' }],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
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
