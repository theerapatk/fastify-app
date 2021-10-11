import fastify, {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
} from 'fastify';
import fastifyAuth from 'fastify-auth';
import fastifyHelmet from 'fastify-helmet';
import fastifySwagger from 'fastify-swagger';
import authPlugin from './plugins/auth';
import authRouters from './routers/auth';
import userRouters from './routers/user';
import SwaggerOption from './schemas/swagger';
import { DuplicateField, ErrorPayload } from './types/error';

const errorHandler = (
  error: FastifyError & { duplicateFields: DuplicateField[] },
  request: FastifyRequest,
  reply: FastifyReply
) => {
  reply.log.warn(error.message);

  const errorPayload: ErrorPayload = {
    error: {
      message: error.message,
    },
  };
  if (error.duplicateFields) errorPayload.error.duplicateFields = error.duplicateFields;
  reply.status(reply.statusCode || 500).send(errorPayload);
  console.log('test');
};

const buildApp = (options: FastifyServerOptions): FastifyInstance => {
  const app = fastify(options);
  app.get('/', async () => 'OK');
  app.register(fastifySwagger, SwaggerOption);
  app.register(fastifyHelmet);
  app.register(fastifyAuth);
  app.register(authPlugin);
  app.register(authRouters, { prefix: 'api/v1/auth' });
  app.register(userRouters, { prefix: 'api/v1/users' });
  app.setErrorHandler(errorHandler);
  return app;
};

export default buildApp;
