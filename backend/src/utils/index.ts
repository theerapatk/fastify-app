import { Secret, sign, SignOptions } from 'jsonwebtoken';
import config from '../config';
import { UserResponse } from '../types/auth';
import * as bcrypt from 'bcrypt';
import { RoleOption } from './enum';

export const hashPassword = (plainPassword: string): string => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plainPassword, salt);
};

export const getAccessToken = (user: UserResponse): string => {
  return signJwtToken({ user }, config.token.access as string, '30m');
};

export const getRefreshToken = (user: UserResponse): string => {
  return signJwtToken({ user }, config.token.refresh as string, '1y');
};

export const isAdmin = (roles: RoleOption[]): boolean => {
  return roles.includes(RoleOption.ADMIN);
};

export const signJwtToken = (
  payload: string | object,
  secret: Secret,
  expiresIn: string
): string => {
  const options: SignOptions = { issuer: 'jojo-tk', expiresIn };
  return sign(payload, secret, options);
};
