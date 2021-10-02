import { FastifyRequest, FastifyReply } from 'fastify';
import { RoleOption } from '../utils/enum';

export type RegisterRequest = FastifyRequest<{
  Body: {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}>;

export type LoginRequest = FastifyRequest<{
  Body: {
    username: string;
    password: string;
  };
}>;

export type RefreshTokenRequest = FastifyRequest<{
  Body: {
    refreshToken: string;
  };
}>;

export type EmailResetPasswordRequest = FastifyRequest<{
  Body: {
    email: string;
  };
}>;

export type ResetPasswordRequest = FastifyRequest<{
  Querystring: {
    token: string;
  };
  Body: {
    password: string;
  };
}>;

export interface UserResponse {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: RoleOption[];
}

export interface AuthTokenResponse {
  accessToken?: string;
  refreshToken?: string;
}
