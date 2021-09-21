import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import fastifyJwt, { FastifyJWTOptions } from 'fastify-jwt';
import fp from 'fastify-plugin';
import config from '../config';

const handler = async (request: FastifyRequest): Promise<void> => {
  try {
    await request.jwtVerify();
  } catch (error) {
    throw error;
  }
};

const auth: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  try {
    const options: FastifyJWTOptions = {
      secret: config.token.access as string,
    };
    fastify.register(fastifyJwt, options);
    fastify.decorate('authenticate', handler);
  } catch (error) {
    fastify.log.error(error);
  }
};

export default fp(auth);
