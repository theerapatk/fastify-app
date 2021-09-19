import { FastifySchema } from 'fastify/types/schema';

const register: FastifySchema = {
  body: {
    type: 'object',
    required: ['email', 'password', 'firstName', 'lastName'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        maxLength: 64,
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 24,
      },
      firstName: {
        type: 'string',
        maxLength: 32,
      },
      lastName: {
        type: 'string',
        maxLength: 32,
      },
    },
  },
};

const login: FastifySchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
    },
  },
};

const refreshToken: FastifySchema = {
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: {
        type: 'string',
      },
    },
  },
};

const emailResetPassword: FastifySchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        maxLength: 64,
      },
    },
  },
};

const resetPassword: FastifySchema = {
  querystring: {
    type: 'object',
    required: ['token'],
    properties: {
      token: {
        type: 'string',
      },
    },
  },
  body: {
    type: 'object',
    required: ['password'],
    properties: {
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 24,
      },
    },
  },
};

export default {
  register,
  login,
  refreshToken,
  emailResetPassword,
  resetPassword,
};
