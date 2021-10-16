import { LightMyRequestResponse } from 'fastify';
import jwt from 'jsonwebtoken';
import { DUPLICATE_KEY_ERROR_CODE } from '../../handlers/auth';
import { UserModel } from '../../models/user';
import { MongoServerError } from '../../types/error';
import RoleOption from '../../utils/enum';
import buildTestApp from '../buildTestApp';

const app = buildTestApp();

describe('/api/v1/users', () => {
  const apiPrefix = '/api/v1/users';
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

  const login = async (payload: {
    username: string;
    password: string;
  }): Promise<LightMyRequestResponse> =>
    app.inject({
      url: '/api/v1/auth/login',
      method: 'POST',
      payload,
    });

  const getUser = async (accessToken: string, id: string): Promise<LightMyRequestResponse> =>
    app.inject({
      url: `${apiPrefix}/${id}`,
      method: 'GET',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

  beforeEach(async () => {
    await new UserModel({
      email: 'admin@admin.com',
      password: '$2b$10$Uf/MpLYACZS0kqBQSx0eYe4fVKNjhGjm8wS0zzqgXugqG08Ee9/3G',
      firstName: 'admin',
      lastName: 'admin',
      roles: [RoleOption.ADMIN],
    }).save();
  });

  describe('GET /', () => {
    const getUsers = async (accessToken: string): Promise<LightMyRequestResponse> =>
      app.inject({
        url: apiPrefix,
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

    it(`should get all users given logged in user's role is 'Admin'`, async () => {
      await register();
      const loginResponse = await login({
        username: 'admin@admin.com',
        password: 'test',
      });
      const response = await getUsers(loginResponse.json().accessToken);

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([
        expect.objectContaining({
          email: 'admin@admin.com',
          firstName: 'admin',
          lastName: 'admin',
          roles: [RoleOption.ADMIN],
        }),
        expect.objectContaining({
          email: 'test@test.com',
          firstName: 'test',
          lastName: 'test',
          roles: [RoleOption.POKEMON_TRAINER],
        }),
      ]);
    });

    it('should not allow other roles to access this resource', async () => {
      await register();
      const loginResponse = await login({
        username: 'test@test.com',
        password: '12345678',
      });
      const response = await getUsers(loginResponse.json().accessToken);

      expect(response.statusCode).toBe(403);
      expect(response.json().error.message).toEqual('You are not allowed to access this resource');
    });

    it('should validate request given request headers is not provided', async () => {
      const response = await app.inject({
        url: apiPrefix,
        method: 'GET',
      });

      expect(response.statusCode).toBe(401);
      expect(response.json().error.message).toEqual(
        'No Authorization was found in request.headers'
      );
    });

    it('should verify jwt token before doing route handler', async () => {
      const response = await getUsers('test.token');

      expect(response.statusCode).toBe(401);
      expect(response.json().error.message).toContain('jwt malformed');
    });
  });

  describe('GET /:id', () => {
    it('should get one user', async () => {
      const registerResponse = await register();
      const token = registerResponse.json().accessToken;
      const response = await getUser(token, getIdFromAccessToken(token));

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          email: 'test@test.com',
          firstName: 'test',
          lastName: 'test',
          roles: [RoleOption.POKEMON_TRAINER],
        })
      );
    });

    it(`should get any users given logged in user's role is 'Admin'`, async () => {
      await register();
      const loginResponse = await login({
        username: 'admin@admin.com',
        password: 'test',
      });

      const token = loginResponse.json().accessToken;
      const user = await UserModel.findOne({ email: 'test@test.com' }).lean();
      const response = await getUser(token, user?._id);

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          email: 'test@test.com',
          firstName: 'test',
          lastName: 'test',
          roles: [RoleOption.POKEMON_TRAINER],
        })
      );
    });

    it(`should only allow to get user's own resource given logged in user's role is not 'Admin'`, async () => {
      const registerResponse = await register();

      const token = registerResponse.json().accessToken;
      const response = await getUser(token, '61499de2e413b105305050e8');

      expect(response.statusCode).toBe(403);
      expect(response.json().error.message).toEqual(
        "You are not allowed to access other user's resource"
      );
    });

    it('should validate request given request headers is not provided', async () => {
      const response = await app.inject({
        url: `${apiPrefix}/61463fb2e413b005305050e8`,
        method: 'GET',
      });

      expect(response.statusCode).toBe(401);
      expect(response.json().error.message).toEqual(
        'No Authorization was found in request.headers'
      );
    });

    it('should validate request given id format is invalid', async () => {
      const response = await app.inject({
        url: `${apiPrefix}/this-is-invalid-id`,
        method: 'GET',
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.message).toContain('should match pattern');
    });

    it('should verify jwt token before doing route handler', async () => {
      const response = await getUser('test.token', '61463fb2e413b005305050e8');

      expect(response.statusCode).toBe(401);
      expect(response.json().error.message).toContain('jwt malformed');
    });

    it('should handle user not found', async () => {
      const registerResponse = await register();
      const token = registerResponse.json().accessToken;
      jest.spyOn(UserModel, 'findById').mockImplementationOnce(
        () =>
          ({
            lean: jest.fn().mockReturnValue(null),
          } as any)
      );

      const response = await getUser(token, getIdFromAccessToken(token));

      expect(response.statusCode).toBe(404);
      expect(response.json().error.message).toContain('User not found');
    });
  });

  describe('PUT /:id', () => {
    const updateBody: Record<string, string | undefined> = {
      email: 'updated@test.com',
      firstName: 'updated',
      lastName: 'test',
    };

    const updateUser = async (
      accessToken: string,
      id: string,
      payload = updateBody
    ): Promise<LightMyRequestResponse> =>
      app.inject({
        url: `${apiPrefix}/${id}`,
        method: 'PUT',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        payload,
      });

    [
      {
        email: 'updated@test.com',
        firstName: 'updated',
        lastName: 'test',
      },
      {
        username: 'my new user name',
        email: 'test@test.com',
        firstName: 'test',
        lastName: 'update last',
      },
    ].forEach((testCase) => {
      it(`should update one user given the request body is ${JSON.stringify(
        testCase
      )}`, async () => {
        const registerResponse = await register();
        const token = registerResponse.json().accessToken;
        const id = getIdFromAccessToken(token);
        const updateResponse = await updateUser(token, id, testCase);
        expect(updateResponse.statusCode).toBe(204);
        expect(updateResponse.body).toEqual('');

        const getResponse = await getUser(token, id);
        expect(getResponse.statusCode).toBe(200);

        if (testCase.username) {
          expect(getResponse.json()).toEqual(
            expect.objectContaining({
              username: 'my new user name',
              email: 'test@test.com',
              firstName: 'test',
              lastName: 'update last',
              roles: [RoleOption.POKEMON_TRAINER],
            })
          );
        } else {
          expect(getResponse.json()).toEqual(
            expect.objectContaining({
              email: 'updated@test.com',
              firstName: 'updated',
              lastName: 'test',
              roles: [RoleOption.POKEMON_TRAINER],
            })
          );
        }
      });
    });

    it(`should update any users given logged in user's role is 'Admin'`, async () => {
      await register();
      const loginResponse = await login({ username: 'admin@admin.com', password: 'test' });
      const token = loginResponse.json().accessToken;
      const user = await UserModel.findOne({ email: 'test@test.com' }).lean();
      const updateResponse = await updateUser(token, user?._id);
      expect(updateResponse.statusCode).toBe(204);
      expect(updateResponse.body).toEqual('');

      const getResponse = await getUser(token, user?._id);
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.json()).toEqual(
        expect.objectContaining({
          email: 'updated@test.com',
          firstName: 'updated',
          lastName: 'test',
          roles: [RoleOption.POKEMON_TRAINER],
        })
      );
    });

    it(`should only allow to get user's own resource given logged in user's role is not 'Admin'`, async () => {
      const registerResponse = await register();

      const token = registerResponse.json().accessToken;
      const response = await updateUser(token, '61499de2e413b105305050e8');

      expect(response.statusCode).toBe(403);
      expect(response.json().error.message).toEqual(
        "You are not allowed to access other user's resource"
      );
    });

    it('should validate request given request headers is not provided', async () => {
      const response = await app.inject({
        url: `${apiPrefix}/61463fb2e413b005305050e8`,
        method: 'PUT',
        payload: updateBody,
      });

      expect(response.statusCode).toBe(401);
      expect(response.json().error.message).toEqual(
        'No Authorization was found in request.headers'
      );
    });

    [
      {
        body: {
          email: 'testtest.com',
          firstName: 'test',
          lastName: 'test',
        },
        errorFieldName: 'email',
      },
      {
        body: {
          username: 'test',
          email: 'test@test.com',
          firstName: 'test',
          lastName: 'test',
        },
        errorFieldName: 'username',
      },
      {
        body: {
          email: 'test@test.com',
          firstName: 'teASDuihasddddjkahsdSADUIUYUSDdst',
          lastName: 'test',
        },
        errorFieldName: 'firstName',
      },
      {
        body: {
          email: 'test@test.com',
          firstName: 'test',
        },
        errorFieldName: 'lastName',
      },
    ].forEach((testCase) => {
      it(`should validate request given '${testCase.errorFieldName}' is invalid`, async () => {
        const registerResponse = await register();
        const token = registerResponse.json().accessToken;
        const id = getIdFromAccessToken(token);

        const response = await updateUser(token, id, testCase.body);

        expect(response.statusCode).toBe(400);
        expect(response.json().error.message).toContain(testCase.errorFieldName);
      });
    });

    it('should verify jwt token before doing route handler', async () => {
      const response = await updateUser('test.token', '61463fb2e413b005305050e8');

      expect(response.statusCode).toBe(401);
      expect(response.json().error.message).toContain('jwt malformed');
    });

    it('should handle user not found', async () => {
      const registerResponse = await register();
      const token = registerResponse.json().accessToken;
      jest.spyOn(UserModel, 'findByIdAndUpdate').mockImplementationOnce(
        () =>
          ({
            lean: jest.fn().mockReturnValue(null),
          } as any)
      );

      const response = await updateUser(token, getIdFromAccessToken(token));

      expect(response.statusCode).toBe(404);
      expect(response.json().error.message).toContain('User not found');
    });

    it('should handle MongoServerError given #findByIdAndUpdate() failed to execute', async () => {
      const registerResponse = await register();
      const token = registerResponse.json().accessToken;
      const error = new Error('MongoError') as MongoServerError;
      error.name = 'MongoServerError';
      error.code = DUPLICATE_KEY_ERROR_CODE;
      error.keyValue = { email: 'test@test.com' };
      jest.spyOn(UserModel, 'findByIdAndUpdate').mockImplementationOnce(
        () =>
          ({
            lean: jest.fn().mockRejectedValue(error),
          } as any)
      );

      const response = await updateUser(token, getIdFromAccessToken(token));

      expect(response.statusCode).toBe(409);
      expect(response.json().error.message).toEqual('Duplicate fields in database');
      expect(response.json().error.duplicateFields).toEqual([
        { field: 'email', value: 'test@test.com' },
      ]);
    });
  });

  describe('DELETE /:id', () => {
    const deleteUser = async (accessToken: string, id: string): Promise<LightMyRequestResponse> =>
      app.inject({
        url: `${apiPrefix}/${id}`,
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

    it('should delete one user', async () => {
      const registerResponse = await register();
      const token = registerResponse.json().accessToken;
      const id = getIdFromAccessToken(token);
      const deleteResponse = await deleteUser(token, id);
      expect(deleteResponse.statusCode).toBe(204);
      expect(deleteResponse.body).toEqual('');

      const getResponse = await getUser(token, id);
      expect(getResponse.statusCode).toBe(404);
      expect(getResponse.json().error.message).toEqual('User not found');
    });

    it(`should update any users given logged in user's role is 'Admin'`, async () => {
      await register();
      const loginResponse = await login({ username: 'admin@admin.com', password: 'test' });
      const token = loginResponse.json().accessToken;
      const user = await UserModel.findOne({ email: 'test@test.com' }).lean();
      const deleteResponse = await deleteUser(token, user?._id);
      expect(deleteResponse.statusCode).toBe(204);
      expect(deleteResponse.body).toEqual('');

      const getResponse = await getUser(token, user?._id);
      expect(getResponse.statusCode).toBe(404);
      expect(getResponse.json().error.message).toEqual('User not found');
    });

    it(`should only allow to get user's own resource given logged in user's role is not 'Admin'`, async () => {
      const registerResponse = await register();

      const token = registerResponse.json().accessToken;
      const response = await deleteUser(token, '61499de2e413b105305050e8');

      expect(response.statusCode).toBe(403);
      expect(response.json().error.message).toEqual(
        "You are not allowed to access other user's resource"
      );
    });

    it('should validate request given request headers is not provided', async () => {
      const response = await app.inject({
        url: `${apiPrefix}/61463fb2e413b005305050e8`,
        method: 'DELETE',
      });

      expect(response.statusCode).toBe(401);
      expect(response.json().error.message).toEqual(
        'No Authorization was found in request.headers'
      );
    });

    it('should validate request given id format is invalid', async () => {
      const response = await app.inject({
        url: `${apiPrefix}/this-is-invalid-id`,
        method: 'DELETE',
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.message).toContain('should match pattern');
    });

    it('should verify jwt token before doing route handler', async () => {
      const response = await deleteUser('test.token', '61463fb2e413b005305050e8');

      expect(response.statusCode).toBe(401);
      expect(response.json().error.message).toContain('jwt malformed');
    });

    it('should handle user not found', async () => {
      const registerResponse = await register();
      const token = registerResponse.json().accessToken;
      jest.spyOn(UserModel, 'findByIdAndDelete').mockImplementationOnce(
        () =>
          ({
            lean: jest.fn().mockReturnValue(null),
          } as any)
      );

      const response = await deleteUser(token, getIdFromAccessToken(token));

      expect(response.statusCode).toBe(404);
      expect(response.json().error.message).toContain('User not found');
    });
  });

  const getIdFromAccessToken = (accessToken: string): string => {
    const decodedToken = jwt.verify(
      accessToken,
      process.env.SECRET_ACCESS_TOKEN as string
    ) as jwt.JwtPayload;
    return decodedToken.user._id;
  };
});
