import { SwaggerOptions } from 'fastify-swagger';

const SwaggerOption: SwaggerOptions = {
  exposeRoute: true,
  swagger: {
    info: {
      title: 'fastify-app api',
      description: 'The fastify-app swagger api',
      version: '0.1.0',
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here',
    },
    host: 'localhost',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [{ name: 'auth', description: 'Authentication related end-points' }],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
  },
};

export default SwaggerOption