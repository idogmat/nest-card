import { ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfirmCode, CreateUserModel, EmailRecovery, LoginInputModel, SetNewPassword } from './model/input/auth.input.model';
import { AuthService } from '../application/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersRepository } from 'src/features/users/infrastructure/users.repository';
import { AuthMeOutputModel } from './model/output/auth.output.model';
import { EmailService } from '../application/email.service';
import { Response } from 'express';
import { AuthLoginCommand } from '../application/user-cases/auth-login-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
    private commandBus: CommandBus
  ) { }


  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Post('/login')
  @HttpCode(200)
  async login(@Res() res: Response, @Body() loginModel: LoginInputModel) {
    const { loginOrEmail, password } = loginModel;

    const result = await this.commandBus.execute(new AuthLoginCommand(
      loginOrEmail,
      password)
    );
    if (!result) throw new UnauthorizedException();
    const { accessToken, refreshToken } = result as { accessToken: string, refreshToken: string; };
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(200).send({ accessToken });
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

  @Post('/registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(@Body() body: ConfirmCode) {
    const { code } = body;
    const result = await this.authService.setConfirm(code);
    if (!result) throw new BadRequestException();
  }

  @Post('/registration')
  @HttpCode(204)
  async registration(@Body() createModel: CreateUserModel) {
    // console.log('render');
    const { login, password, email } = createModel;
    const user = await this.usersRepository.findByLoginAndEmail(login, email);
    if (user) throw new BadRequestException();
    const createdUserId = await this.authService.registration(login, password, email);
    const code = await this.authService.setConfirmRegistrationCode(createdUserId);
    await this.emailService.sendMail(login, email, code);
  }

  @Post('/registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(@Body() recovery: EmailRecovery) {
    const { email } = recovery;
    const user = await this.usersRepository.findByEmail(email);
    const code = await this.authService.setConfirmRegistrationCode(user.id);
    await this.emailService.sendMail(user.login, email, code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async authMe(@Request() req) {
    const user = await this.usersRepository.getById(req.user.userId);
    if (!user) throw new UnauthorizedException();

    return AuthMeOutputModel.getAuthMe(user);
  }
}
