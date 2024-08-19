import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';

const regUser = { login: 'name77', password: 'qwerty1221', email: 'email3787@gil.em' };

describe('auth', () => {
  let app: INestApplication;

  beforeAll(async () => {

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = await moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create user', async () => {
    const result = await request(app.getHttpServer())
      .post('/auth/registration')
      .send(regUser);
    expect(result.status).toBe(204);

    const { login: loginOrEmail, password } = regUser;

    const loginRequest = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail, password });
    expect(loginRequest.status).toBe(200);
    expect(loginRequest.body).toHaveProperty('accessToken');

  });

  it('should get user data', async () => {
    const { login: loginOrEmail, password } = regUser;

    const loginRequest = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ loginOrEmail, password });

    expect(loginRequest.status).toBe(200);
    expect(loginRequest.body).toHaveProperty('accessToken');

    const accessToken: string = loginRequest.body?.accessToken.toString();

    const authMeRequest = await request(app.getHttpServer())
      .get('/auth/me')
      .set({ Authorization: "Bearer " + accessToken })
      .send({ loginOrEmail, password });

    expect(authMeRequest.status).toBe(200);
    expect(authMeRequest.body).toEqual({ login: regUser.login, email: regUser.email, userId: expect.any(String) });
  });
});