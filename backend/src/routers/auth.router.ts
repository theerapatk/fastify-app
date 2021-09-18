import { FastifyInstance } from 'fastify';
import authHandler from '../handlers/auth.handler';

const authRouters = async (app: FastifyInstance) => {
  app.post('/register', authHandler.register);
  app.post('/login', authHandler.login);
  app.post('/refresh-token', authHandler.refreshToken);
  app.post('/email-reset-password', authHandler.emailResetPassword);
  app.post('/reset-password', authHandler.resetPassword);
};

export default authRouters;
