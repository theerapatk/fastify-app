import { JwtPayload, verify } from 'jsonwebtoken';
import LightMyRequest from 'light-my-request';
import { RoleOption } from '../../types/enum';
import { buildTestApp } from '../buildTestApp';
import { KeyString } from '../types';

const app = buildTestApp();

describe('/api/v1/auth', () => {
  const registerBody: KeyString = {
    email: 'test@test.com',
    password: '12345678',
    firstName: 'test',
    lastName: 'test',
  };

  const loginBody: KeyString = {
    username: registerBody.email,
    password: registerBody.password,
  };

  it('POST /register should register a user', async () => {
    const response = await app.inject({
      url: '/api/v1/auth/register',
      method: 'POST',
      payload: registerBody,
    });

    expect(response.statusCode).toBe(201);
    expectTokenResponse(response, registerBody);
  });

  it('POST /login should register a user', async () => {
    await app.inject({
      url: '/api/v1/auth/register',
      method: 'POST',
      payload: registerBody,
    });

    const response = await app.inject({
      url: '/api/v1/auth/login',
      method: 'POST',
      payload: loginBody,
    });

    expect(response.statusCode).toBe(200);
    expectTokenResponse(response, registerBody);
  });

  it('POST /refresh-token should register a user', async () => {
    const registerResponse = await app.inject({
      url: '/api/v1/auth/register',
      method: 'POST',
      payload: registerBody,
    });

    const response = await app.inject({
      url: '/api/v1/auth/refresh-token',
      method: 'POST',
      payload: {
        refreshToken: registerResponse.json().refreshToken,
      },
    });

    expect(response.statusCode).toBe(200);
    expectTokenResponse(response, registerBody);
  });

  test.todo('POST /email-reset-password');
  test.todo('POST /reset-password');
  test.todo('GET /guard');

  const expectTokenResponse = (
    response: LightMyRequest.Response,
    expectedBody: KeyString
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
    expectedBody: KeyString
  ) => {
    const decodedToken = verify(token, secret) as JwtPayload;
    const iat = new Date(decodedToken.iat! * 1000);
    const exp = new Date(decodedToken.exp! * 1000);
    const expiresIn = Math.abs(exp.getMinutes() - iat.getMinutes());
    if (expiresIn === 0) {
      expect(iat.getDate()).toEqual(exp.getDate());
      expect(iat.getMonth()).toEqual(exp.getMonth());
      expect(exp.getFullYear() - iat.getFullYear()).toEqual(1);
    } else {
      expect(expiresIn).toEqual(30);
    }
    Object.keys(decodedToken.user).forEach((key: string) => {
      if (key === 'roles') {
        expect(decodedToken.user[key]).toEqual([RoleOption.POKEMON_TRAINER]);
      } else {
        expect(decodedToken.user[key]).toEqual(expectedBody[key]);
      }
    });
  };
});
