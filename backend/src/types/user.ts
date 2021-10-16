import { FastifyRequest } from 'fastify/types/request';

export type UserRequestParam = FastifyRequest<{
  Params: {
    id: string;
  };
}>;

export type UpdateUserRequest = FastifyRequest<{
  Params: {
    id: string;
  };
  Body: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}>;
