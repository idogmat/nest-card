import { ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfirmCode, CreateUserModel, EmailRecovery, LoginInputModel, SetNewPassword } from './model/input/auth.input.model';
import { AuthService } from '../application/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthMeOutputModel } from './model/output/auth.output.model';
import { EmailService } from '../application/email.service';
import { Request, Response } from 'express';
import { AuthLoginCommand } from '../application/user-cases/auth-login-use-case';
import { CommandBus } from '@nestjs/cqrs';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RefreshGuard } from 'src/common/guards/refresh.guard';
import { DevicesService } from 'src/features/devices/application/devices.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly devicesService: DevicesService,
    private commandBus: CommandBus
  ) { }


  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @Post('/login')
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body() loginModel: LoginInputModel
  ) {
    const { loginOrEmail, password } = loginModel;

    const browser = req.get("user-agent") || 'null';
    const ip = req.ip || req.headers["x-forwarded-for"] || 'null';

    const result = await this.commandBus.execute(new AuthLoginCommand(
      loginOrEmail,
      password, { ip: ip.toString(), title: browser.toString() })
    );
    if (!result) throw new UnauthorizedException();
    const { accessToken, refreshToken } = result as { accessToken: string, refreshToken: string; };
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(200).send({ accessToken });
  }

  @UseGuards(ThrottlerGuard)
  @Post('/password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() recovery: EmailRecovery) {
    const { email } = recovery;
    const user = await this.authService.findByEmail(email);
    if (!user) throw new BadRequestException();
    const code = await this.authService.setRecoveryCode(user.id);
    await this.emailService.sendMailPasswordRecovery(user.login, user.email, code);
  }

  @UseGuards(ThrottlerGuard)
  @Post('/new-password')
  @HttpCode(204)
  async setNewPassword(@Body() recovery: SetNewPassword) {
    const { newPassword, recoveryCode } = recovery;

    const user = await this.authService.findByRecoveryCode(recoveryCode);
    if (!user) throw new BadRequestException();

    await this.authService.setNewPssword(user.id, newPassword, user.passwordSalt);
  }

  @UseGuards(ThrottlerGuard)
  @Post('/registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(@Body() body: ConfirmCode) {
    const { code } = body;
    const result = await this.authService.setConfirm(code);
    if (!result) throw new BadRequestException();
  }

  @UseGuards(ThrottlerGuard)
  @Post('/registration')
  @HttpCode(204)
  async registration(@Body() createModel: CreateUserModel) {
    // console.log('render');
    const { login, password, email } = createModel;
    const user = await this.authService.findByLoginAndEmail(login, email);
    if (user) throw new BadRequestException();
    const createdUserId = await this.authService.registration(login, password, email);
    const code = await this.authService.setConfirmRegistrationCode(createdUserId);
    await this.emailService.sendMail(login, email, code);
  }

  @UseGuards(ThrottlerGuard)
  @Post('/registration-email-resending')
  @HttpCode(204)
  async registrationEmailResending(@Body() recovery: EmailRecovery) {
    const { email } = recovery;
    const user = await this.authService.findByEmail(email);
    const code = await this.authService.setConfirmRegistrationCode(user.id);
    await this.emailService.sendMail(user.login, email, code);
  }

  @UseGuards(RefreshGuard)
  @Post('/refresh-token')
  async refreshToken(
    @Req() req,
    @Res() res
  ) {
    const lastActiveDate = new Date().getTime();
    await this.devicesService.updateDate(req.user.deviceId, lastActiveDate);

    const accessToken = await this.authService.createToken({
      userId: req.user.userId,
      login: req.user.login,
      deviceId: req.user.deviceId,
      lastActiveDate,
    });
    const refreshToken = await this.authService.createRefreshToken({
      userId: req.user.userId,
      login: req.user.login,
      deviceId: req.user.deviceId,
      lastActiveDate,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.status(200).send({ accessToken });
  }

  @UseGuards(RefreshGuard)
  @Post('/logout')
  @HttpCode(204)
  async logout(
    @Req() req,
    @Res() res: Response
  ) {
    await this.devicesService.delete(req.user.deviceId, req.user.userId);
    res.clearCookie("refreshToken", { httpOnly: true, secure: true });
    res.sendStatus(204);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async authMe(@Req() req) {
    const user = await this.authService.getById(req.user.userId);
    if (!user) throw new UnauthorizedException();

    return AuthMeOutputModel.getAuthMe(user);
  }
}
