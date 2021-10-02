import { FastifyRequest } from 'fastify/types/request';
import createError from 'http-errors';
import { JwtPayload } from 'jsonwebtoken';
import { UserModel } from '../models/user';
import { UserResponse } from '../types/auth';
import { GetOneUserRequest } from '../types/user';
import { isAdmin } from '../utils';

const getAll = async (request: FastifyRequest): Promise<UserResponse[]> => {
  try {
    const { roles } = (request.user as JwtPayload).user as UserResponse;
    if (!isAdmin(roles!)) {
      throw new createError.Forbidden(
        'You are not allowed to access this resource'
      );
    }
    const users = await UserModel.find();
    return users;
  } catch (error) {
    throw error;
  }
};

const getOne = async (request: GetOneUserRequest): Promise<UserResponse> => {
  try {
    let id = request.params.id;
    const { _id, roles } = (request.user as JwtPayload).user as UserResponse;
    if (!isAdmin(roles!) && _id !== id) {
      throw new createError.Forbidden(
        "You are not allowed to access other user's resource"
      );
    }

    const user = await UserModel.findOne({ _id: id }).lean();
    if (!user) throw new createError.NotFound('User not found');

    return user;
  } catch (error) {
    throw error;
  }
};

export default {
  getAll,
  getOne,
};
