import { FastifyServerOptions } from 'fastify';
import buildApp from './app';
import config from './config';
import connectMongoDB from './mongo';

const options: FastifyServerOptions = {
  logger: true,
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
