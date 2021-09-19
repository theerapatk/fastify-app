import { FastifyInstance } from 'fastify';
import mongoose, { ConnectOptions } from 'mongoose';
import config from './config';

const connectMongoDB = async (app: FastifyInstance) => {
  try {
    await mongoose.connect(config.mongodb.uri);
    app.log.info('Connected to MongoDB');

    mongoose.connection.on('error', (err) => app.log.error(err.message));
    mongoose.connection.on('disconnected', () =>
      app.log.info('Disconnected from MongoDB')
    );
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  } catch (error) {
    app.log.error(`Failed connecting to MongoDB due to ${error}`);
  }
};

export default connectMongoDB;
