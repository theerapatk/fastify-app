import mailService from '@sendgrid/mail';
import { LightMyRequestResponse } from 'fastify';
import jwt from 'jsonwebtoken';
import { DUPLICATE_KEY_ERROR_CODE } from '../../handlers/auth';
import { UserModel } from '../../models/user';
import { MongoServerError } from '../../types/error';
import RoleOption from '../../utils/enum';
import buildTestApp from '../buildTestApp';

const app = buildTestApp();

describe('/api/v1/auth', () => {
  const registerBody: Record<string, string | undefined> = {
    email: 'test@test.com',
    password: '12345678',
    firstName: 'test',
    lastName: 'test',
  };

  const register = async (payload = registerBody): Promise<LightMyRequestResponse> =>
    app.inject({
      url: '/api/v1/auth/register',
      method: 'POST',
      payload,
    });

  describe('POST /register', () => {
    it('should register user', async () => {
      const response = await register();

      expect(response.statusCode).toBe(201);
      expectTokenResponse(response, registerBody);
    });

    [
      {
        body: {
          username: 'teASDuihasddddjkahsdSADUIUYUSDdst',
          email: 'test@test.com',
          password: '1245678',
          firstName: 'test',
          lastName: 'test',
        },
        errorFieldName: 'username',
      },
      {
        body: {
          email: 'testtest.com',
          password: '1245678',
          firstName: 'test',
          lastName: 'test',
        },
        errorFieldName: 'email',
      },
      {
        body: {
          email: 'test@test.com',
          password: '123678',
          firstName: 'test',
          lastName: 'test',
        },
        errorFieldName: 'password',
      },
      {
        body: {
          email: 'test@test.com',
          password: '12345678',
          firstName: 'teASDuihasddddjkahsdSADUIUYUSDdst',
          lastName: 'test',
        },
        errorFieldName: 'firstName',
      },
      {
        body: {
          email: 'test@test.com',
          password: '12345678',
          firstName: 'test',
        },
        errorFieldName: 'lastName',
      },
    ].forEach((testCase) => {
      it(`should validate request given '${testCase.errorFieldName}' is invalid`, async () => {
        const response = await register(testCase.body);

        expect(response.statusCode).toBe(400);
        expect(response.json().error.message).toContain(testCase.errorFieldName);
      });
    });

    it(`should handle duplicate fields in database`, async () => {
      await register();
      const response = await register();

      expect(response.statusCode).toBe(409);
      expect(response.json().error.message).toEqual('Duplicate fields in database');
      const { duplicateFields } = response.json().error;
      expect(duplicateFields.length).toEqual(2);
      expect(duplicateFields[0].field).toEqual('email');
      expect(duplicateFields[0].value).toEqual(registerBody.email);
      expect(duplicateFields[1].field).toEqual('firstName and lastName');
      expect(duplicateFields[1].value).toEqual(
        `${registerBody.firstName} ${registerBody.lastName}`
      );
    });

    it(`should handle duplicate username field in database`, async () => {
      const username = 'myusername';
      await register({ ...registerBody, username });
      const response = await register({
        username,
        email: 'test1@test.com',
        password: '12345678',
        firstName: 'test1',
        lastName: 'test',
      });

      expect(response.statusCode).toBe(409);
      expect(response.json().error.message).toEqual('Duplicate fields in database');
      const { duplicateFields } = response.json().error;
      expect(duplicateFields.length).toEqual(1);
      expect(duplicateFields[0].field).toEqual('username');
      expect(duplicateFields[0].value).toEqual(username);
    });

    it('should handle MongoServerError given #save() failed to execute', async () => {
      await register();
      const error = new Error('MongoError') as MongoServerError;
      error.name = 'MongoServerError';
      error.code = DUPLICATE_KEY_ERROR_CODE;
      jest.spyOn(UserModel.prototype, 'save').mockRejectedValueOnce(error);

      const response = await register({
        username: 'myusername',
        email: 'test1@test.com',
        password: '12345678',
        firstName: 'test1',
        lastName: 'test',
      });

      expect(response.statusCode).toBe(409);
    });
  });

  describe('POST /login', () => {
    const loginBody: { username?: string; password?: string } = {
      username: registerBody.email,
      password: registerBody.password,
    };

    const login = async (payload = loginBody): Promise<LightMyRequestResponse> =>
      app.inject({
        url: '/api/v1/auth/login',
        method: 'POST',
        payload,
      });

    it('should login user', async () => {
      await register();
      const response = await login();

      expect(response.statusCode).toBe(200);
      expectTokenResponse(response, registerBody);
    });

    [
      {
        body: {
          password: '1245678',
        },
        errorFieldName: 'username',
      },
      {
        body: {
          username: 'test@test.com',
        },
        errorFieldName: 'password',
      },
    ].forEach((testCase) => {
      it(`should validate request given '${testCase.errorFieldName}' is invalid`, async () => {
        await register();
        const response = await login(testCase.body);

        expect(response.statusCode).toBe(400);
        expect(response.json().error.message).toContain(testCase.errorFieldName);
      });
    });

    [
      {
        body: {
          username: 'test1@test.com',
          password: '1245678',
        },
        errorFieldName: 'username',
      },
      {
        body: {
          username: 'test@test.com',
          password: '12456789',
        },
        errorFieldName: 'password',
      },
    ].forEach((testCase) => {
      it(`should handle invalid credentials given '${testCase.errorFieldName}' is invalid`, async () => {
        await register();
        const response = await login(testCase.body);

        expect(response.statusCode).toBe(401);
        expect(response.json().error.message).toEqual('Invalid credentials');
      });
    });
  });

  describe('POST /refresh-token', () => {
    const refreshToken = async (payload: {
      refreshToken?: string;
    }): Promise<LightMyRequestResponse> =>
      app.inject({
        url: '/api/v1/auth/refresh-token',
        method: 'POST',
        payload,
      });

    it('should refresh token', async () => {
      const registerResponse = await register();
      const response = await refreshToken(registerResponse.json());

      expect(response.statusCode).toBe(200);
      expectTokenResponse(response, registerBody);
    });

    it("should validate request given 'refreshToken' is missing", async () => {
      await register();
      const response = await refreshToken({});

      expect(response.statusCode).toBe(400);
      expect(response.json().error.message).toContain('refreshToken');
    });

    [{ shouldDeleteMany: false }, { shouldDeleteMany: true }].forEach((testCase) => {
      it('should handle invalid token', async () => {
        const registerResponse = await register();
        let refreshTokenBody = { refreshToken: 'invalid.token' };
        if (testCase.shouldDeleteMany) {
          await UserModel.deleteMany();
          refreshTokenBody = registerResponse.json();
        }
        const response = await refreshToken(refreshTokenBody);

        expect(response.statusCode).toBe(401);
      });
    });
  });

  describe('POST /email-reset-password', () => {
    const emailResetPassword = async (payload: {
      email?: string;
    }): Promise<LightMyRequestResponse> =>
      app.inject({
        url: '/api/v1/auth/email-reset-password',
        method: 'POST',
        payload,
      });

    it('should email a reset password link', async () => {
      await register();
      const mock = jest
        .spyOn(mailService, 'send')
        .mockImplementationOnce(async () => [{} as any, {}]);

      await emailResetPassword({ email: registerBody.email });

      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'jojo.theerapat@hotmail.com',
          to: registerBody.email,
          subject: 'Request to reset password',
          html: expect.stringContaining('/api/v1/auth/reset-password?token='),
        })
      );
    });

    it("should validate request given 'email' is invalid", async () => {
      await register();
      const response = await emailResetPassword({});

      expect(response.statusCode).toBe(400);
      expect(response.json().error.message).toContain('email');
    });

    it('should handle if the email does not exist in the database', async () => {
      await register();
      const response = await emailResetPassword({ email: 'test1@test.com' });

      expect(response.statusCode).toBe(404);
      expect(response.json().error.message).toEqual('Email not found');
    });
  });

  describe('POST /reset-password', () => {
    const resetPassword = async (
      payload: {
        password?: string;
      },
      queryParam = 'token=test.token'
    ): Promise<LightMyRequestResponse> =>
      app.inject({
        url: `/api/v1/auth/reset-password?${queryParam}`,
        method: 'POST',
        payload,
      });

    it('should reset password', async () => {
      await register();
      const user = await UserModel.findOne({
        email: registerBody.email,
      }).lean();
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({
        user: {
          email: registerBody.email,
          password: user?.password,
        },
      }));
      const response = await resetPassword({ password: '87654321' });

      expect(response.statusCode).toBe(200);
      expect(response.json().message).toEqual('Successfully reset password');
    });

    [
      {
        errorFieldName: 'password',
      },
      {
        errorFieldName: 'token',
      },
    ].forEach((testCase) => {
      it(`should validate request given '${testCase.errorFieldName}' is invalid`, async () => {
        let requestBody = {};
        let queryParam = '';
        if (testCase.errorFieldName === 'password') {
          queryParam = '?token=test.token';
        } else if (testCase.errorFieldName === 'token') {
          requestBody = { password: '87654321' };
        }

        const response = await resetPassword(requestBody, queryParam);

        expect(response.statusCode).toBe(400);
        expect(response.json().error.message).toContain(testCase.errorFieldName);
      });
    });

    it('should handle invalid token', async () => {
      await register();
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({
        user: {
          email: registerBody.email,
          password: 'invalid.password',
        },
      }));
      const response = await resetPassword({ password: '87654321' });

      expect(response.statusCode).toBe(404);
      expect(response.json().error.message).toEqual('Invalid token');
    });

    it('should handle internal server error', async () => {
      await register();
      const user = await UserModel.findOne({
        email: registerBody.email,
      }).lean();
      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => ({
        user: {
          email: registerBody.email,
          password: user?.password,
        },
      }));

      const error = new Error('MongoError') as MongoServerError;
      error.name = 'MongoServerError';
      error.code = DUPLICATE_KEY_ERROR_CODE;
      jest.spyOn(UserModel.prototype, 'save').mockRejectedValueOnce(error);

      const response = await resetPassword({ password: '87654321' });

      expect(response.statusCode).toBe(500);
      expect(response.json().error.message).toEqual('Failed to reset password');
    });
  });

  const expectTokenResponse = (
    response: LightMyRequestResponse,
    expectedBody: Record<string, string | undefined>
  ) => {
    expectClaimAndPayload(
      response.json().accessToken,
      process.env.SECRET_ACCESS_TOKEN as string,
      expectedBody
    );
    expectClaimAndPayload(
      response.json().refreshToken,
      process.env.SECRET_REFRESH_TOKEN as string,
      expectedBody
    );
  };

  const expectClaimAndPayload = (
    token: string,
    secret: string,
    expectedBody: Record<string, string | undefined>
  ) => {
    const decodedToken = jwt.verify(token, secret) as jwt.JwtPayload;
    const iat = new Date((decodedToken.iat ?? 0) * 1000);
    const exp = new Date((decodedToken.exp ?? 0) * 1000);
    const expiresIn = Math.abs(exp.getMinutes() - iat.getMinutes());
    if (expiresIn === 0) {
      const diffInMillisec = Math.abs(Number(exp) - Number(iat));
      const oneDay = 1000 * 60 * 60 * 24;
      const days = Math.floor(diffInMillisec / oneDay);
      expect(days).toEqual(365);
    } else {
      expect(expiresIn).toEqual(30);
    }
    const userTokenKeys = Object.keys(decodedToken.user);
    expect(userTokenKeys).toEqual(['_id', 'email', 'firstName', 'lastName', 'roles']);
    userTokenKeys.forEach((key: string) => {
      if (key === 'roles') {
        expect(decodedToken.user[key]).toEqual([RoleOption.POKEMON_TRAINER]);
      } else if (key !== '_id') {
        expect(decodedToken.user[key]).toEqual(expectedBody[key]);
      } else {
        expect(decodedToken.user).toEqual(expect.objectContaining({ _id: expect.any(String) }));
      }
    });
  };
});
