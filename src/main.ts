import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './settings/app-settings';
import { applyAppSettings } from './settings/apply-app-setting';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  applyAppSettings(app);

  await app.listen(appSettings.api.APP_PORT, () => {
    console.log('App starting listen port: ', appSettings.api.APP_PORT);
    console.log('ENV: ', appSettings.env.getEnv());
  });
}

bootstrap();
