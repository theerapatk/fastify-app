import { FastifyRequest } from 'fastify/types/request';
import createError from 'http-errors';
import { JwtPayload } from 'jsonwebtoken';
import { UserModel } from '../models/user';
import { UserResponse } from '../types/auth';
import { UserRequestParam, UpdateUserRequest } from '../types/user';
import { isAdmin } from '../utils';
import RoleOption from '../utils/enum';

const getUsers = async (request: FastifyRequest): Promise<UserResponse[]> => {
  const { roles } = (request.user as JwtPayload).user as UserResponse;
  if (!isAdmin(roles as RoleOption[])) {
    throw new createError.Forbidden('You are not allowed to access this resource');
  }
  const users = await UserModel.find();
  return users;
};

const getUser = async (request: UserRequestParam): Promise<UserResponse> => {
  const { id } = request.params;
  const { _id, roles } = (request.user as JwtPayload).user as UserResponse;
  checkIfNotAdminAndSelf(roles, _id, id);

  const user = await UserModel.findOne({ _id: id }).lean();
  if (!user) throw new createError.NotFound('User not found');

  return user;
};

const updateUser = async (request: UpdateUserRequest): Promise<{ message: string } | unknown> => {
  const { id } = request.params;
  const { _id, roles } = (request.user as JwtPayload).user as UserResponse;
  checkIfNotAdminAndSelf(roles, _id, id);

  const user = await UserModel.updateOne({ _id: id });
  if (!user) throw new createError.NotFound('User not found');

  return { message: 'success' };
};

const deleteUser = async (request: UserRequestParam): Promise<{ message: string } | unknown> => {
  const { id } = request.params;
  const { _id, roles } = (request.user as JwtPayload).user as UserResponse;
  checkIfNotAdminAndSelf(roles, _id, id);
  await UserModel.deleteOne({ _id: id });
  return { message: 'success' };
};

const checkIfNotAdminAndSelf = (
  roles: RoleOption[] | undefined,
  requestId: string,
  jwtId: string
): void => {
  if (!isAdmin(roles as RoleOption[]) && requestId !== jwtId) {
    throw new createError.Forbidden("You are not allowed to access other user's resource");
  }
};

export default {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
