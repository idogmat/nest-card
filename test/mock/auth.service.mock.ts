import { AuthService } from 'src/features/auth/application/auth.service';
import { UsersRepository } from 'src/features/users/infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { AppSettings } from 'src/settings/app-settings';

//  .overrideProvider(UsersService)
//  .useValue(UserServiceMockObject)
export const AuthServiceMockObject = {
  sendMessageOnEmail(_email: string) {
    console.log('Call mock method sendMessageOnEmail / MailService');
    return Promise.resolve(true);
  },
  create() {
    return Promise.resolve('123');
  },
};

//  .overrideProvider(UsersService)
//  .useClass(UserServiceMock)
// or
// .overrideProvider(UsersService)
// .useFactory({
//      factory: (usersRepo: UsersRepository) => {
//          return new UserServiceMock(usersRepo);
//      },
//      inject: [UsersRepository]
//      }
//     )

export class AuthServiceMock extends AuthService {
  constructor(appSettings: AppSettings,
    usersRepository: UsersRepository,
    jwtService: JwtService) {
    super(appSettings, usersRepository, jwtService);
  }
}