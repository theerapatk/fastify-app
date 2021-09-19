import { FastifyServerOptions } from 'fastify';
import buildApp from './app';
import config from './config';
import connectMongoDB from './mongo';
import { v4 as uuid } from 'uuid';
import pino from 'pino';

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
  genReqId(req) {
    return uuid();
  },
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
