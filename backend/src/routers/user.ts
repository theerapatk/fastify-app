import { FastifyInstance } from 'fastify/types/instance';
import userHandler from '../handlers/user';
import userSchema from '../schemas/user';

const authRouters = async (
  app: FastifyInstance & {
    auth?: any;
    authenticate?: any;
  }
) => {
  app.addHook('preHandler', app.auth([app.authenticate]));
  app.get('/', { schema: userSchema.getAll }, userHandler.getAll);
  app.get('/:id', { schema: userSchema.getOne }, userHandler.getOne);
};

export default authRouters;
