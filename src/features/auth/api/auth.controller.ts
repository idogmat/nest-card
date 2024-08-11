import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateUserModel, LoginInputModel } from './model/input/auth.input.model';
import { AuthService } from '../application/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersQueryRepository } from 'src/features/users/infrastructure/users.query-repository';



// Tag для swagger
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) { }


  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Body() loginModel: LoginInputModel) {
    const { loginOrEmail, password } = loginModel;

    const accessToken = await this.authService.login(
      loginOrEmail,
      password,
    );

    console.log(accessToken);

    return { accessToken };
  }

  // @Post('/password-recovery')
  // async passwordRecovery(@Body() createModel: UserCreateModel) {
  //   const { login, password, email } = createModel;

  //   const createdUserId = await this.usersService.create(
  //     login,
  //     password,
  //     email,
  //   );

  //   const createdUser: UserOutputModel | null =
  //     await this.usersQueryRepository.getById(createdUserId);

  //   return createdUser;
  // }

  // @Post('/new-password')
  // async setNewPassword(@Body() createModel: UserCreateModel) {
  //   const { login, password, email } = createModel;

  //   const createdUserId = await this.usersService.create(
  //     login,
  //     password,
  //     email,
  //   );

  //   const createdUser: UserOutputModel | null =
  //     await this.usersQueryRepository.getById(createdUserId);

  //   return createdUser;
  // }

  // @Post('/registration-confirmation')
  // async registrationConfirmation(@Body() createModel: UserCreateModel) {
  //   const { login, password, email } = createModel;

  //   const createdUserId = await this.usersService.create(
  //     login,
  //     password,
  //     email,
  //   );

  //   const createdUser: UserOutputModel | null =
  //     await this.usersQueryRepository.getById(createdUserId);

  //   return createdUser;
  // }

  @HttpCode(204)
  @Post('/registration')
  async registration(@Body() createModel: CreateUserModel) {
    const { login, password, email } = createModel;
    await this.authService.registration(login, password, email);
    // if (!createdUser) {
    //   throw new UnauthorizedException();
    // }
  }

  // @Post('/registration-email-resending')
  // async registrationEmailResending(@Body() createModel: UserCreateModel) {
  //   const { login, password, email } = createModel;

  //   const createdUserId = await this.usersService.create(
  //     login,
  //     password,
  //     email,
  //   );

  //   const createdUser: UserOutputModel | null =
  //     await this.usersQueryRepository.getById(createdUserId);

  //   return createdUser;
  // }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async authMe(@Request() req) {
    const user = await this.usersQueryRepository.getById(req.user.userId);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
