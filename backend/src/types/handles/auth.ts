import { FastifyRequest } from 'fastify'

export type AuthLoginBodyRequest = FastifyRequest<{
  Body: {
    username: string,
    password: string
  }
}>
