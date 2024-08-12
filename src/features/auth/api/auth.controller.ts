import { ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
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
import { UsersRepository } from 'src/features/users/infrastructure/users.repository';
import { AuthMeOutputModel, EmailRecovery, SetNewPassword } from './model/output/auth.output.model';
import { EmailService } from '../application/email.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService
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


  @Post('/password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() recovery: EmailRecovery) {
    const { email } = recovery;
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new BadRequestException();
    const code = await this.authService.setRecoveryCode(user.id);
    await this.emailService.sendMailPasswordRecovery(user.login, user.email, code);
  }

  @Post('/new-password')
  @HttpCode(204)
  async setNewPassword(@Body() recovery: SetNewPassword) {
    const { newPassword, recoveryCode } = recovery;

    const user = await this.usersRepository.findByRecoveryCode(recoveryCode);
    if (!user) throw new BadRequestException();

    await this.authService.setNewPssword(user.id, newPassword, user.passwordSalt);
  }

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
    const user = await this.usersRepository.getById(req.user.userId);
    if (!user) throw new UnauthorizedException();

    return AuthMeOutputModel.getAuthMe(user);
  }
}
