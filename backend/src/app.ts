import fastify, {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
} from 'fastify';
import authRouters from './routers/auth';
import { SwaggerOption } from './schemas/swagger';
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
  if (error.duplicateFields)
    errorPayload.error.duplicateFields = error.duplicateFields;
  reply.status(reply.statusCode || 500).send(errorPayload);
};

const buildApp = (options: FastifyServerOptions): FastifyInstance => {
  const app = fastify(options);
  app.get('/', async () => 'OK');
  app.register(require('fastify-swagger'), SwaggerOption);
  app.register(require('fastify-auth'));
  app.register(require('./plugins/authenticate'));
  app.register(authRouters, { prefix: 'api/v1/auth' });
  app.setErrorHandler(errorHandler);
  return app;
};

export default buildApp;
