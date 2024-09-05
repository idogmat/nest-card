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

// const usersProviders: Provider[] = [
//   UsersRepository,
//   UsersService,
//   UsersQueryRepository,
// ];
// const blogsProviders: Provider[] = [
//   BlogsRepository,
//   BlogsService,
//   BlogsQueryRepository,
// ];
// const postsProviders: Provider[] = [
//   PostsRepository,
//   PostsService,
//   PostsQueryRepository,
// ];
// const validators: Provider[] = [
//   CustomEmailValidation,
//   CustomLoginValidation,
//   CustomCodeValidation,
//   CustomEmailExistValidation,
//   CustomBlogIdValidation,
// ];
// const authProviders: Provider[] = [
//   AuthService,
//   JwtService,
//   JwtStrategy,
//   LocalStrategy,
//   EmailService,
// ];
// const commentsProviders: Provider[] = [
//   CommentsRepository,
//   CommentsService,
//   CommentsQueryRepository,
// ];

// const devicesProviders: Provider[] = [
//   DevicesService,
//   DevicesQueryRepository,
//   DevicesRepository
// ];

// const useCases = [
//   AuthLoginUseCase
// ];

const env = getConfiguration();
console.log(getConfiguration().THROTTLER_LIMIT);
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
    // CqrsModule,
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
  // Регистрация контроллеров
  controllers: [],
})
export class AppModule { }
