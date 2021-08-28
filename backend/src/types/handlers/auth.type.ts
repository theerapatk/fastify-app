import { FastifyRequest } from 'fastify'

export type LoginBodyRequest = FastifyRequest<{
  Body: {
    username: string,
    password: string
  }
}>

export type RegisterBodyRequest = FastifyRequest<{
  Body: {
    username: string
    password: string
    email: string
    firstName: string
    lastName: string
  }
}>

export interface LoginBodyResponse {
  accessToken?: string
  refreshToken?: string
}

export interface RefreshTokenResponse {
  accessToken: string
}