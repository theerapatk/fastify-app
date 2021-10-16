import { errorProperties, TagsSchema } from './auth';

const userProperties = {
  _id: { type: 'string' },
  email: { type: 'string' },
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  roles: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
};

const getUsers: TagsSchema = {
  tags: ['user'],
  response: {
    200: {
      description: 'OK',
      type: 'array',
      items: {
        type: 'object',
        properties: userProperties,
      },
    },
  },
};

const getUser: TagsSchema = {
  tags: ['user'],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
  response: {
    200: {
      description: 'OK',
      type: 'object',
      properties: userProperties,
    },
    404: {
      description: 'Not Found',
      type: 'object',
      properties: errorProperties,
    },
  },
};

const updateUser: TagsSchema = {
  tags: ['user'],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
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
      additionalProperties: false,
    },
  },
  response: {
    204: {
      description: 'No Content',
      type: 'object',
    },
    404: {
      description: 'Not Found',
      type: 'object',
      properties: errorProperties,
    },
  },
};

const deleteUser: TagsSchema = {
  tags: ['user'],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{24}$',
      },
    },
  },
  response: {
    204: {
      description: 'No Content',
      type: 'object',
    },
    404: {
      description: 'Not Found',
      type: 'object',
      properties: errorProperties,
    },
  },
};

export default {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
