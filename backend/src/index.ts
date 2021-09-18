import { FastifyServerOptions } from 'fastify';
import mongoose from 'mongoose';
import buildApp from './app';
import config from './config';

const options: FastifyServerOptions = {
  logger: true,
};

const startServer = async () => {
  try {
    const app = buildApp(options);
    await mongoose.connect(config.mongodb.uri);
    mongoose.connection.on('error', (error) => app.log.error(error));
    mongoose.connection.once('open', () =>
      app.log.info('MongoDB has been connected')
    );
    app.listen(config.port, '0.0.0.0');
  } catch {}
};

startServer();
