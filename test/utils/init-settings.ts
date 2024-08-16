import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../src/app.module';
import { UsersService } from '../../src/features/users/application/users.service';
import { appSettings } from '../../src/settings/app-settings';
import { applyAppSettings } from '../../src/settings/apply-app-setting';
import { UsersTestManager } from './routes/users-test-manager';
import { UserServiceMockObject } from '../mock/user.service.mock';
import { deleteAllData } from './delete-all-data';
import { AuthTestManager } from './routes/auth-test-manager';
import { JwtModule } from '@nestjs/jwt';
import env from 'dotenv';
env.config();

const secret = process.env.ACCESS_SECRET_TOKEN || 'any';
const expiresIn = process.env.ACCESS_SECRET_TOKEN_EXPIRATION || '15m';

export const initSettings = async (
  //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  console.log('in tests ENV: ', appSettings.env.getEnv());
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();

  applyAppSettings(app);

  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer();
  const userTestManager = new UsersTestManager(app);
  const authTestManager = new AuthTestManager(app);
  await deleteAllData(databaseConnection);

  //TODO:переписать через setState
  return {
    app,
    databaseConnection,
    httpServer,
    userTestManager,
    authTestManager
  };
};