import fastify, { FastifyServerOptions } from 'fastify';
import authRouters from './routers/auth';

const buildApp = (options: FastifyServerOptions) => {
  const app = fastify(options)
  app.get('/', async () => 'OK')
  app.register(authRouters, { prefix: 'api/v1/auth' })
  app.setErrorHandler((error, request, reply) => {
    reply
      .status(error.statusCode || 500)
      .send({
        error: {
          message: error.message,
          code: error.code
        }
      })
  })
  return app
};

export default buildApp