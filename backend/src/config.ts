import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/fastify-app',
  },
  token: {
    access: process.env.SECRET_ACCESS_TOKEN || null,
    refresh: process.env.SECRET_REFRESH_TOKEN || null,
  },
  sendGridApiKey: process.env.SENDGRID_API_KEY,
};

export default config;
