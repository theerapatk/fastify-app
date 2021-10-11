import { FastifyRequest } from 'fastify/types/request';
import createError from 'http-errors';
import { JwtPayload } from 'jsonwebtoken';
import { UserModel } from '../models/user';
import { UserResponse } from '../types/auth';
import { GetOneUserRequest } from '../types/user';
import { isAdmin } from '../utils';
import RoleOption from '../utils/enum';

const getAll = async (request: FastifyRequest): Promise<UserResponse[]> => {
  const { roles } = (request.user as JwtPayload).user as UserResponse;
  if (!isAdmin(roles as RoleOption[])) {
    throw new createError.Forbidden('You are not allowed to access this resource');
  }
  const users = await UserModel.find();
  return users;
};

const getOne = async (request: GetOneUserRequest): Promise<UserResponse> => {
  const { id } = request.params;
  const { _id, roles } = (request.user as JwtPayload).user as UserResponse;
  if (!isAdmin(roles as RoleOption[]) && _id !== id) {
    throw new createError.Forbidden("You are not allowed to access other user's resource");
  }

  const user = await UserModel.findOne({ _id: id }).lean();
  if (!user) throw new createError.NotFound('User not found');

  return user;
};

export default {
  getAll,
  getOne,
};
