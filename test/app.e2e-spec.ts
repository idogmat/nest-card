import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { UserCreateModel } from '../src/features/users/api/models/input/create-user.input.model';
import { UsersService } from '../src/features/users/application/users.service';
import { applyAppSettings } from '../src/settings/apply-app-setting';
import { skipSettings } from './utils/skip-settings';
import { UsersTestManager } from './utils/users-test-manager';
import { aDescribe } from './utils/aDescribe';
import { UserServiceMock } from './mock/user.service.mock';

const TEST_ADMIN_CREDENTIALS = {
  login: 'test',
  password: 'qwerty',
};

// Кастомная реализация пропуска тестов
aDescribe(skipSettings.for('appTests'))('AppController (e2e)', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      //.useValue(UserServiceMockObject)
      .useClass(UserServiceMock)
      // .useFactory({
      //     factory: (usersRepo: UsersRepository, authService: AuthService) => {
      //         return new UserServiceMock(usersRepo, authService);
      //     },
      //     inject: [UsersRepository, AuthService]
      // }
      //)
      .compile();


    app = moduleFixture.createNestApplication();

    // Применяем все настройки приложения (pipes, guards, filters, ...)
    applyAppSettings(app);

    await app.init();

    // Init userManager
    userTestManger = new UsersTestManager(app);

    // change env
    console.log(process.env.ENV);

    /*   const loginResult1 =   await request(app.getHttpServer())
            .post('/login')
            .send({
                login: TEST_ADMIN_CREDENTIALS.login
                , password: TEST_ADMIN_CREDENTIALS.password
            })
            .expect(200);*/

    const loginResult = await userTestManger.login(
      TEST_ADMIN_CREDENTIALS.login,
      TEST_ADMIN_CREDENTIALS.password,
    );

    // Работа с состоянием
    expect.setState({
      adminTokens: loginResult,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ create user tests (POST)', async () => {
    // Work with state
    const { adminTokens } = expect.getState();

    const createModel: UserCreateModel = {
      login: 'name1',
      password: 'qwerty',
      email: 'some-email@gg.cc',
    };

    const createResponse = await userTestManger.createUser(
      adminTokens.accessToken,
      createModel,
    );

    userTestManger.expectCorrectModel(createModel, createResponse.body);

    const updateModel = { name: 'qwerty_777' };

    const updateResponse = await userTestManger.updateUser(
      adminTokens.accessToken,
      createResponse.body.id,
      updateModel,
    );

    userTestManger.expectCorrectModel(updateModel, updateResponse.body);
  });

  it('Auxiliary functions', async () => {
    const array = [1, 2, 3];

    // expect(array.length).toBe(3);
    expect(array).toHaveLength(3);

    // === false
    expect(false).toBeFalsy();
    // === true
    expect(true).toBeTruthy();
    // === null
    expect(null).toBeNull();
    // Свойство в объекте присутствует
    expect('Any string').toBeDefined();

    // Любая строка
    expect('Any string').toEqual(expect.any(String));
    // Любой массив
    expect([]).toEqual(expect.any(Array));

    // not null
    expect(100).not.toBeNull();
  });
});