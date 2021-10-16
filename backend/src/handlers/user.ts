import { FastifyReply } from 'fastify/types/reply';
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

  const user = await UserModel.findById(id).lean();
  if (!user) throw new createError.NotFound('User not found');

  return user;
};

const updateUser = async (request: UpdateUserRequest, reply: FastifyReply): Promise<void> => {
  const { id } = request.params;
  const { _id, roles } = (request.user as JwtPayload).user as UserResponse;
  checkIfNotAdminAndSelf(roles, _id, id);
  const user = await UserModel.findByIdAndUpdate(id, request.body);
  if (!user) throw new createError.NotFound('User not found');
  reply.code(204).send();
};

const deleteUser = async (request: UserRequestParam, reply: FastifyReply): Promise<void> => {
  const { id } = request.params;
  const { _id, roles } = (request.user as JwtPayload).user as UserResponse;
  checkIfNotAdminAndSelf(roles, _id, id);
  const user = await UserModel.findByIdAndDelete(id);
  if (!user) throw new createError.NotFound('User not found');
  reply.code(204).send();
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
