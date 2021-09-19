import { FastifySchema } from 'fastify/types/schema';

const register: FastifySchema & { tags: string[] } = {
  tags: ['auth'],
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
  response: {
    201: {
      description: 'Successful response',
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  },
};

const login: FastifySchema & { tags: string[] } = {
  tags: ['auth'],
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
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  },
};

const refreshToken: FastifySchema & { tags: string[] } = {
  tags: ['auth'],
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: {
        type: 'string',
      },
    },
  },
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  },
};

const emailResetPassword: FastifySchema & { tags: string[] } = {
  tags: ['auth'],
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
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  },
};

const resetPassword: FastifySchema & { tags: string[] } = {
  tags: ['auth'],
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
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        message: { type: 'string' },
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
