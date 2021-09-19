import { FastifyRequest } from 'fastify';
import { VerifyPayloadType } from 'fastify-jwt';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify/types/instance';
import config from '../config';

export default fp(async (fastify: FastifyInstance) => {
  fastify.register(require('fastify-jwt'), {
    secret: config.token.access,
  });

  fastify.decorate(
    'authenticate',
    async (
      request: FastifyRequest & {
        jwtVerify: Promise<{ decoded: object } & VerifyPayloadType>;
      }
    ) => {
      try {
        await request.jwtVerify();
      } catch (error) {
        throw error;
      }
    }
  );
});
