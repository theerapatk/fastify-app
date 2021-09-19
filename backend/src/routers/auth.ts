import { FastifyInstance } from 'fastify';
import authHandler from '../handlers/auth';
import authSchema from '../schemas/auth';

const authRouters = async (app: FastifyInstance) => {
  app.post('/register', { schema: authSchema.register }, authHandler.register);
  app.post('/login', { schema: authSchema.login }, authHandler.login);
  app.post(
    '/refresh-token',
    { schema: authSchema.refreshToken },
    authHandler.refreshToken
  );
  app.post(
    '/email-reset-password',
    { schema: authSchema.emailResetPassword },
    authHandler.emailResetPassword
  );
  app.post(
    '/reset-password',
    { schema: authSchema.resetPassword },
    authHandler.resetPassword
  );
};

export default authRouters;
