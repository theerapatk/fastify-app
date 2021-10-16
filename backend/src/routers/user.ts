import { FastifyInstance } from 'fastify/types/instance';
import userHandler from '../handlers/user';
import userSchema from '../schemas/user';

const authRouters = async (
  app: FastifyInstance & {
    auth?: any;
    authenticate?: any;
  }
): Promise<void> => {
  app.addHook('preHandler', app.auth([app.authenticate]));
  app.get('/', { schema: userSchema.getUsers }, userHandler.getUsers);
  app.get('/:id', { schema: userSchema.getUser }, userHandler.getUser);
  app.put('/:id', { schema: userSchema.updateUser }, userHandler.updateUser);
  app.delete('/:id', { schema: userSchema.deleteUser }, userHandler.deleteUser);
};

export default authRouters;
