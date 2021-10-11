import buildTestApp from './buildTestApp';

const app = buildTestApp();

describe('/', () => {
  it('GET returns 200', async () => {
    const response = await app.inject({ method: 'GET', url: '/' });
    expect(response.statusCode).toEqual(200);
  });
});
