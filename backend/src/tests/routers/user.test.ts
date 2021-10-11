import { LightMyRequestResponse } from 'fastify';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/user';
import RoleOption from '../../utils/enum';
import buildTestApp from '../buildTestApp';
// import { register } from './auth.test';

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

    it(`should get all users given the role is 'Admin'`, async () => {
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
    const getUser = async (accessToken: string, id: string): Promise<LightMyRequestResponse> =>
      app.inject({
        url: `${apiPrefix}/${id}`,
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

    it('should get one user', async () => {
      const registerResponse = await register();

      const token = registerResponse.json().accessToken;
      const decodedToken = jwt.verify(
        token,
        process.env.SECRET_ACCESS_TOKEN as string
      ) as jwt.JwtPayload;
      const response = await getUser(token, decodedToken.user._id);

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

    it(`should get any users given the role is 'Admin'`, async () => {
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

    it(`should only allow to get user's own resource given the role is not 'Admin'`, async () => {
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
  });
});
