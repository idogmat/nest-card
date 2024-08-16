import { INestApplication } from '@nestjs/common';
import { AuthService } from '../src/features/auth/application/auth.service';
import { UsersRepository } from '../src/features/users/infrastructure/users.repository';
import { initSettings } from './utils/init-settings';
import { AppSettings } from 'src/settings/app-settings';
import { JwtService } from '@nestjs/jwt';
import { AuthServiceMock } from './mock/auth.service.mock';
import { AuthTestManager } from './utils/routes/auth-test-manager';

describe('auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      //override UsersService еще раз
      moduleBuilder
        .overrideProvider(AuthService)
        .useFactory({
          factory: (appSettings: AppSettings,
            usersRepository: UsersRepository,
            jwtService: JwtService) => {
            return new AuthServiceMock(appSettings, usersRepository, jwtService);
          }, inject: [AppSettings, UsersRepository, JwtService]
        }).compile(),
    );
    app = result.app;
    authTestManager = result.authTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create user', async () => {
    const body = { login: 'name77', password: 'qwerty', email: 'email77@gma.em' };
    // console.log(authTestManager);
    const response = await authTestManager.registration(body);
    expect(response.status).toBe(201);
  });

  it('should get users', async () => {
    // const body = { login: 'name2', password: 'qwerty', email: 'email2@email.em' };

    // await userTestManger.createUser('admin', body);

    // const getUserResponse = await request(app.getHttpServer())
    //   .get(`/api/users`)
    //   .expect(200);

    // expect(getUserResponse.body.totalCount).toBe(2);
  });
});