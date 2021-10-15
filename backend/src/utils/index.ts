import { Secret, sign } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import config from '../config';
import { UserResponse } from '../types/auth';
import RoleOption from './enum';

export const hashPassword = (plainPassword: string): string =>
  bcrypt.hashSync(plainPassword, bcrypt.genSaltSync(10));

export const getAccessToken = (user: UserResponse): string =>
  signJwtToken({ user }, config.token.access as string, '30m');

export const getRefreshToken = (user: UserResponse): string =>
  signJwtToken({ user }, config.token.refresh as string, '1y');

export const isAdmin = (roles: RoleOption[]): boolean => {
  if (!roles) return false;
  return roles.includes(RoleOption.ADMIN);
};

export const signJwtToken = (payload: string | object, secret: Secret, expiresIn: string): string =>
  sign(payload, secret, { issuer: 'jojo-tk', expiresIn });
