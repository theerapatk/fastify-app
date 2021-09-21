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

  it('POST /register should register user', async () => {
    const response = await app.inject({
      url: '/api/v1/auth/register',
      method: 'POST',
      payload: registerBody,
    });

    expect(response.statusCode).toBe(201);
    expectTokenResponse(response, registerBody);
  });

  [
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
    it(`POST /register should validate request given '${testCase.errorFieldName}' is invalid`, async () => {
      const response = await app.inject({
        url: '/api/v1/auth/register',
        method: 'POST',
        payload: testCase.body,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error.message).toContain(testCase.errorFieldName);
    });
  });

  it(`POST /register should handle duplicate fields in database`, async () => {
    await app.inject({
      url: '/api/v1/auth/register',
      method: 'POST',
      payload: registerBody,
    });

    const response = await app.inject({
      url: '/api/v1/auth/register',
      method: 'POST',
      payload: registerBody,
    });

    app.log.warn(response.json());
    expect(response.statusCode).toBe(409);
    expect(response.json().error.message).toEqual(
      'Duplicate fields in database'
    );
    const duplicateFields = response.json().error.duplicateFields;
    expect(duplicateFields.length).toEqual(2);
    expect(duplicateFields[0].field).toEqual('email');
    expect(duplicateFields[0].value).toEqual(registerBody.email);
    expect(duplicateFields[1].field).toEqual('firstName and lastName');
    expect(duplicateFields[1].value).toEqual(
      `${registerBody.firstName} ${registerBody.lastName}`
    );
  });

  it('POST /login should login user', async () => {
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

  it('POST /refresh-token should refresh token', async () => {
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

  it.todo('POST /email-reset-password should email a reset password link');
  it.todo('POST /reset-password should reset password');
  it.todo('GET /guard should verify jwt token before doing handler');

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
