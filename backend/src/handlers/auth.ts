import mailService, { MailDataRequired } from '@sendgrid/mail';
import * as bcrypt from 'bcrypt';
import createError from 'http-errors';
import { JwtPayload, verify } from 'jsonwebtoken';
import config from '../config';
import { User, UserModel } from '../models/user';
import {
  AuthTokenResponse,
  EmailResetPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserResponse,
} from '../types/auth';
import { MongoServerError } from '../types/error';
import {
  getAccessToken,
  getRefreshToken,
  hashPassword,
  signJwtToken,
} from '../utils';

mailService.setApiKey(config.sendGridApiKey!);

const register = async (
  request: RegisterRequest
): Promise<AuthTokenResponse> => {
  await validateUniqueFieldConstraint(request.body);

  try {
    request.body.password = hashPassword(request.body.password);
    const { email, firstName, lastName, roles } = await new UserModel(
      request.body
    ).save();
    const userResponse = { email, firstName, lastName, roles };
    return buildAuthTokenResponse(userResponse);
  } catch (error) {
    if (error instanceof Error && error.name === 'MongoServerError') {
      if ((error as MongoServerError).code === 11000) {
        throw new createError.Conflict(error.message);
      }
    }
    throw error;
  }
};

const login = async (request: LoginRequest): Promise<AuthTokenResponse> => {
  const { username, password } = request.body;

  const user = await UserModel.findOne({
    $or: [{ username }, { email: username }],
  }).lean();
  if (!user) throw new createError.Unauthorized('Invalid credentials');

  const matched = bcrypt.compareSync(password, user.password);
  if (!matched) throw new createError.Unauthorized('Invalid credentials');

  const { email, firstName, lastName, roles } = user;
  return buildAuthTokenResponse({ email, firstName, lastName, roles });
};

const refreshToken = async (request: RefreshTokenRequest) => {
  const { refreshToken } = request.body;

  try {
    if (!refreshToken) throw new createError.BadRequest();

    const decodedToken = verify(
      refreshToken,
      config.token.refresh as string
    ) as JwtPayload;
    const user = await UserModel.findOne({
      email: decodedToken.user.email,
    }).lean();
    if (!user) throw new createError.Unauthorized();

    const { email, firstName, lastName, roles } = user;
    return {
      accessToken: getAccessToken({ email, firstName, lastName, roles }),
      refreshToken,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      throw new createError.Unauthorized();
    }
    return error;
  }
};

const emailResetPassword = async (request: EmailResetPasswordRequest) => {
  const { email } = request.body;

  try {
    if (!email) throw new createError.BadRequest('Email is required');

    const user = await UserModel.findOne({ email }).lean();
    if (!user) throw new createError.NotFound('Email not found');

    const token = signJwtToken({ user }, config.token.access as string, '3m');
    const message: MailDataRequired = {
      from: 'jojo.theerapat@hotmail.com',
      to: email,
      subject: 'Request to reset password',
      html: `<div>
                 <p>Please use below link to reset your password</p>
                 <a href='http://localhost:3000/api/v1/auth/reset-password?token=${token}' target='blank'>Reset Password</a>
             </div>`,
    };

    const response = await mailService.send(message);
    if (!response || response[0]?.statusCode !== 202) {
      throw new createError.BadGateway(`Unable to send the email to ${email}`);
    }
    return { message: `We have sent the reset password link to ${email}` };
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (request: ResetPasswordRequest) => {
  const { token } = request.query;
  const { password } = request.body;

  try {
    const decodedToken = verify(
      token,
      config.token.access as string
    ) as JwtPayload;
    const user = await UserModel.findOne({
      email: decodedToken.user.email,
      password: decodedToken.user.password,
    }).lean();
    if (!user) throw new createError.NotFound('Invalid link');

    const hashedPassword = hashPassword(password);
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: user.email },
      { password: hashedPassword },
      { new: true }
    );
    if (!updatedUser)
      throw new createError.InternalServerError('Failed to reset password');

    return { message: 'Successfully reset password' };
  } catch (error) {
    throw error;
  }
};

const validateUniqueFieldConstraint = async (doc: User) => {
  const { username, email, firstName, lastName } = doc;
  const orQuery: {}[] = [{ email }, { firstName, lastName }];
  if (username) orQuery.push({ username });
  const existingUser = await UserModel.findOne({ $or: orQuery }).lean();
  if (existingUser) {
    const errors = [];
    if (username && username === existingUser.username) {
      errors.push({ field: 'username', value: username });
    }
    if (email === existingUser.email) {
      errors.push({ field: 'email', value: email });
    }
    if (
      firstName === existingUser.firstName &&
      lastName === existingUser.lastName
    ) {
      errors.push({
        field: 'firstName and lastName',
        value: `${firstName} ${lastName}`,
      });
    }
    if (errors.length > 0) {
      const duplicateFields = errors.map((error) => error.field);
      throw new createError.Conflict(
        `These fields have been registered: ${duplicateFields.join(', ')}`
      );
    }
  }
};

const buildAuthTokenResponse = (user: UserResponse): AuthTokenResponse => {
  return {
    accessToken: getAccessToken(user),
    refreshToken: getRefreshToken(user),
  };
};

export default {
  register,
  login,
  refreshToken,
  emailResetPassword,
  resetPassword,
};
