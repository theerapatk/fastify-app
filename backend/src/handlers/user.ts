import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';
import createError from 'http-errors';
import { JwtPayload } from 'jsonwebtoken';
import { UserModel } from '../models/user';
import { UserResponse } from '../types/auth';
import { MongoServerError } from '../types/error';
import { UpdateUserRequest, UserRequestParam } from '../types/user';
import { isAdmin } from '../utils';
import RoleOption from '../utils/enum';
import { DUPLICATE_KEY_ERROR_CODE } from './auth';

const getUsers = async (request: FastifyRequest): Promise<UserResponse[]> => {
  const { roles } = (request.user as JwtPayload).user as UserResponse;
  if (!isAdmin(roles as RoleOption[])) {
    throw new createError.Forbidden('You are not allowed to access this resource');
  }
  const users = await UserModel.find().lean();
  return users;
};

const getUser = async (request: UserRequestParam): Promise<UserResponse> => {
  const { id } = request.params;
  checkIfNotAdminAndSelf(request.user as JwtPayload, id);
  const user = await UserModel.findById(id).lean();
  if (!user) throw new createError.NotFound('User not found');
  return user;
};

const updateUser = async (request: UpdateUserRequest, reply: FastifyReply): Promise<void> => {
  const { id } = request.params;
  checkIfNotAdminAndSelf(request.user as JwtPayload, id);

  try {
    const user = await UserModel.findByIdAndUpdate(id, request.body, {
      projection: { _id: 1 },
    }).lean();
    if (!user) throw new createError.NotFound('User not found');
    reply.code(204).send();
  } catch (error) {
    if (error instanceof Error && error.name === 'MongoServerError') {
      const mongoError = error as MongoServerError;
      if (mongoError.code === DUPLICATE_KEY_ERROR_CODE) {
        if (mongoError.keyValue) {
          const duplicateFields: unknown[] = [];
          Object.entries(mongoError.keyValue).forEach(([field, value]) => {
            duplicateFields.push({ field, value });
          });
          throw createError(409, 'Duplicate fields in database', {
            duplicateFields,
          });
        }
      }
    }
    throw error;
  }
};

const deleteUser = async (request: UserRequestParam, reply: FastifyReply): Promise<void> => {
  const { id } = request.params;
  checkIfNotAdminAndSelf(request.user as JwtPayload, id);
  const user = await UserModel.findByIdAndDelete(id, {
    projection: { _id: 1 },
  }).lean();
  if (!user) throw new createError.NotFound('User not found');
  reply.code(204).send();
};

const checkIfNotAdminAndSelf = (payload: JwtPayload, requestId: string): void => {
  const jwtUser = payload.user as UserResponse;
  if (!isAdmin(jwtUser.roles as RoleOption[]) && requestId !== jwtUser._id) {
    throw new createError.Forbidden("You are not allowed to access other user's resource");
  }
};

export default {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
