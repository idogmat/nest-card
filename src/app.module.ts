import { Module } from '@nestjs/common';
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
import { TypeOrmModule } from '@nestjs/typeorm';

const env = getConfiguration();
@Module({
  // Регистрация модулей
  imports: [
    AuthModule,
    UserModule,
    DeviceModule,
    ContentModule,
    TestModule,
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: '127.0.0.1',
    //   port: 5433,
    //   username: 'postgres',
    //   password: 'postgres',
    //   database: 'test',
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return configService.get('DB');
      },
      inject: [ConfigService]
    }),
    ThrottlerModule.forRoot([{
      ttl: env.THROTTLER_TTL,
      limit: env.THROTTLER_LIMIT,
    }]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [getConfiguration]
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
