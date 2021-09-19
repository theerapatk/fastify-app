import { FastifySchema } from 'fastify/types/schema';

interface AuthSchema extends FastifySchema {
  tags: string[];
}

const errorProperties = {
  error: {
    type: 'object',
    properties: {
      message: { type: 'string' },
    },
  },
};

const register: AuthSchema = {
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
      description: 'OK',
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
    409: {
      description: 'Conflict',
      type: 'object',
      properties: {
        error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            duplicateFields: { type: 'array' },
          },
        },
      },
    },
  },
};

const login: AuthSchema = {
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
      description: 'OK',
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
    401: {
      description: 'Unauthorized',
      type: 'object',
      properties: errorProperties,
    },
  },
};

const refreshToken: AuthSchema = {
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
      description: 'OK',
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
    400: {
      description: 'Bad Request',
      type: 'object',
      properties: errorProperties,
    },
    401: {
      description: 'Unauthorized',
      type: 'object',
      properties: errorProperties,
    },
    500: {
      description: 'Internal Server Error',
      type: 'object',
      properties: errorProperties,
    },
  },
};

const emailResetPassword: AuthSchema = {
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
      description: 'OK',
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    404: {
      description: 'Not Found',
      type: 'object',
      properties: errorProperties,
    },
    502: {
      description: 'Bad Gateway',
      type: 'object',
      properties: errorProperties,
    },
  },
};

const resetPassword: AuthSchema = {
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
      description: 'OK',
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    400: {
      description: 'Bad Request',
      type: 'object',
      properties: errorProperties,
    },
    404: {
      description: 'Not Found',
      type: 'object',
      properties: errorProperties,
    },
    500: {
      description: 'Internal Server Error',
      type: 'object',
      properties: errorProperties,
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
