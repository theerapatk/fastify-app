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

const getAll: TagsSchema = {
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

const getOne: TagsSchema = {
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

export default {
  getAll,
  getOne,
};
