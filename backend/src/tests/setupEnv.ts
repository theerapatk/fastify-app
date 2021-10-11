const setupEnv = (): void => {
  process.env.MONGO_URI = 'mongodb://localhost:27017/fastify-app-test';
  process.env.SECRET_ACCESS_TOKEN = 'access@fastify#app';
  process.env.SECRET_REFRESH_TOKEN = 'refresh@fastify#app';
  process.env.NODE_ENV = 'test';
};

export default setupEnv;
