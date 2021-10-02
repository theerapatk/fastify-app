import { FastifyRequest } from 'fastify/types/request';

export type GetOneUserRequest = FastifyRequest<{
  Params: {
    id: string;
  };
}>;
