import * as dotenv from 'dotenv'

dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/fastify-app'
  }
}

export default config