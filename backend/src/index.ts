import { FastifyServerOptions } from 'fastify';
import { v4 as uuid } from 'uuid';
import pino from 'pino';
import buildApp from './app';
import config from './config';
import connectMongoDB from './mongo';

const logger = pino({
  prettyPrint: {
    colorize: true,
    translateTime: true,
    ignore: 'pid,hostname',
    singleLine: true,
  },
});

const options: FastifyServerOptions = {
  logger,
  genReqId: () => uuid(),
};

const startServer = async () => {
  const app = buildApp(options);
  try {
    await connectMongoDB(app);
    await app.listen(config.port);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

startServer();
