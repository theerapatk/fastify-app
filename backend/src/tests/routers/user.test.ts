import { LightMyRequestResponse } from 'fastify';
import jwt from 'jsonwebtoken';
import { buildTestApp } from '../buildTestApp';
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

  const register = async (
    payload = registerBody
  ): Promise<LightMyRequestResponse> => {
    return app.inject({
      url: '/api/v1/auth/register',
      method: 'POST',
      payload,
    });
  };

  describe('GET /', () => {
    const getUsers = async (
      accessToken: string
    ): Promise<LightMyRequestResponse> => {
      return app.inject({
        url: apiPrefix,
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
    };

    it('should get all users', async () => {
      await register();
      const registerResponse = await register({
        email: 'test1@test.com',
        password: '12345678',
        firstName: 'test1',
        lastName: 'test',
      });

      const response = await getUsers(registerResponse.json().accessToken);

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([
        expect.objectContaining({
          email: 'test@test.com',
          firstName: 'test',
          lastName: 'test',
          roles: ['Pokémon Trainer'],
        }),
        expect.objectContaining({
          email: 'test1@test.com',
          firstName: 'test1',
          lastName: 'test',
          roles: ['Pokémon Trainer'],
        }),
      ]);
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
    const getUser = async (
      accessToken: string,
      id: string
    ): Promise<LightMyRequestResponse> => {
      return app.inject({
        url: `${apiPrefix}/${id}`,
        method: 'GET',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
    };

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
          roles: ['Pokémon Trainer'],
        })
      );
    });

    it('should handle given the user not found', async () => {
      const registerResponse = await register();

      const token = registerResponse.json().accessToken;
      const response = await getUser(token, '61499de2e413b105305050e8');

      expect(response.statusCode).toBe(404);
      expect(response.json().error.message).toEqual('User not found');
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
