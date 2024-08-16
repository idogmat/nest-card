import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthService } from '../src/features/auth/application/auth.service';
import { UsersService } from '../src/features/users/application/users.service';
import { UsersRepository } from '../src/features/users/infrastructure/users.repository';
import { UserServiceMock } from './mock/user.service.mock';
import { initSettings } from './utils/init-settings';
import { UsersTestManager } from './utils/routes/users-test-manager';

describe('users', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      //override UsersService еще раз
      moduleBuilder
        .overrideProvider(UsersService)
        .useFactory({
          factory: (repo: UsersRepository, authService: AuthService) => {
            return new UserServiceMock(repo, authService);
          }, inject: [UsersRepository, AuthService]

        }),
    );
    app = result.app;
    userTestManger = result.userTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create user', async () => {
    const body = { login: 'name1', password: 'qwerty', email: 'email@email.em' };

    const response = await userTestManger.createUser('admin', body);

    expect(response.body).toEqual({ login: body.login, email: body.email, id: expect.any(String), createdAt: expect.any(String) });
  });

  it('should get users', async () => {
    const body = { login: 'name2', password: 'qwerty', email: 'email2@email.em' };

    await userTestManger.createUser('admin', body);

    const getUserResponse = await request(app.getHttpServer())
      .get(`/api/users`)
      .expect(200);

    expect(getUserResponse.body.totalCount).toBe(2);
  });
});