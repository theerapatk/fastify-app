import { mongoose } from '@typegoose/typegoose';
import { FastifyInstance } from 'fastify/types/instance';
import pino from 'pino';
import buildApp from '../app';
import { UserModel } from '../models/user';
import setupEnv from './setupEnv';

// const clearDatabaseSql = `DELETE FROM notes; DELETE FROM users;`
const logger = pino({
  prettyPrint: {
    colorize: true,
    translateTime: true,
    ignore: 'pid,hostname',
    singleLine: true,
  },
});

export const buildTestApp = (): FastifyInstance => {
  setupEnv();
  const app = buildApp({});

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI as string);
    await app.ready();
    await UserModel.deleteMany();
  });

  beforeEach(async () => {
    await UserModel.deleteMany();
  });

  afterEach(async () => {
    await UserModel.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await app.close();
  });

  return app;
};
