import config from '../config';

const setupEnv = (): void => {
  process.env.NODE_ENV = 'test';
  process.env.MONGO_URI = 'mongodb://localhost:27017/fastify-app-test';
  process.env.SECRET_ACCESS_TOKEN = config.token.access;
  process.env.SECRET_REFRESH_TOKEN = config.token.refresh;
};

export default setupEnv;
