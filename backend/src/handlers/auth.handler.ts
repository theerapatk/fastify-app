import userService from '../services/user.service';
import {
  AuthTokenResponse,
  EmailResetPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../types/auth';

const register = async (
  request: RegisterRequest
): Promise<AuthTokenResponse> => {
  const { username, password, email, firstName, lastName } = request.body;
  return await userService.register({
    username,
    password,
    email,
    firstName,
    lastName,
  });
};

const login = async (request: LoginRequest): Promise<AuthTokenResponse> => {
  const { username, password } = request.body;
  return await userService.login(username, password);
};

const refreshToken = async (request: RefreshTokenRequest) => {
  const { refreshToken } = request.body;
  return await userService.refreshToken(refreshToken);
};

const emailResetPassword = async (request: EmailResetPasswordRequest) => {
  const { email } = request.body;
  return await userService.emailResetPassword(email);
};

const resetPassword = async (request: ResetPasswordRequest) => {
  const { token } = request.query;
  const { password } = request.body;
  return await userService.resetPassword(token, password);
};

export default {
  register,
  login,
  refreshToken,
  emailResetPassword,
  resetPassword,
};
