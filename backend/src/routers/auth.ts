import { FastifyInstance } from 'fastify/types/instance';
import authHandler from '../handlers/auth';
import authSchema from '../schemas/auth';

const authRouters = async (
  app: FastifyInstance & { auth?: any; authenticate?: any }
) => {
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
  app.get(
    '/guard',
    { preHandler: app.auth([app.authenticate]) },
    async () => 'OK'
  );
};

export default authRouters;
