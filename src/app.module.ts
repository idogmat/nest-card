import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppSettings, appSettings } from './settings/app-settings';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { getConfiguration } from './settings/configuration';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/users/users.module';
import { DeviceModule } from './features/devices/device.module';
import { ContentModule } from './features/content/content.module';
import { TestModule } from './features/testing/testing.module';

const env = getConfiguration();
@Module({
  // Регистрация модулей
  imports: [
    AuthModule,
    UserModule,
    DeviceModule,
    ContentModule,
    TestModule,
    ThrottlerModule.forRoot([{
      ttl: env.THROTTLER_TTL,
      limit: env.THROTTLER_LIMIT,
    }]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [getConfiguration]
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const uri = configService.get('ENV') === 'TESTING'
          ? configService.get('MONGO_CONNECTION_URI_FOR_TESTS')
          : configService.get('MONGO_CONNECTION_URI');
        return { uri };
      },
      inject: [ConfigService]
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('ACCESS_SECRET_TOKEN'),
          signOptions: { expiresIn: configService.get('ACCESS_SECRET_TOKEN_EXPIRATION') },
        };
      },
      inject: [ConfigService]
    }),
  ],
  providers: [
    {
      provide: AppSettings,
      useValue: appSettings,
    },
    ConfigService,
  ],
  controllers: [],
})
export class AppModule { }
