import { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import config from './config';

const connectMongoDB = async (app: FastifyInstance): Promise<void> => {
  try {
    mongoose.connection.on('error', (err) => {
      app.log.error({ actor: 'MongoDB' }, err.message);
    });
    mongoose.connection.on('disconnected', () => {
      app.log.info({ actor: 'MongoDB' }, 'Disconnected from MongoDB');
    });
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });

    await mongoose.connect(config.mongodb.uri);
    app.log.info({ actor: 'MongoDB' }, 'Connected to MongoDB');
  } catch (error) {
    app.log.error(`Failed connecting to MongoDB due to ${error}`);
  }
};

export default connectMongoDB;
