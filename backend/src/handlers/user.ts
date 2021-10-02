import { UserModel } from '../models/user';
import { UserResponse } from '../types/auth';
import { GetOneUserRequest } from '../types/user';
import createError from 'http-errors';

const getAll = async (): Promise<UserResponse[]> => {
  try {
    return await UserModel.find();
  } catch (error) {
    throw error;
  }
};

const getOne = async (request: GetOneUserRequest): Promise<UserResponse> => {
  try {
    const user = await UserModel.findOne({
      _id: request.params.id,
    }).lean();

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
