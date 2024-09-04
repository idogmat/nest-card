import { AuthService } from "../auth.service";
import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DevicesService } from "src/features/devices/application/devices.service";
import { UsersService } from "src/features/users/application/users.service";

@Injectable()
export class AuthLoginCommand {
  constructor(
    public readonly loginOrEmail: string,
    public readonly password: string,
    public readonly device: { ip: string, title: string; }
  ) { }
  // async execute() { }
}

@CommandHandler(AuthLoginCommand)
@Injectable()
export class AuthLoginUseCase implements ICommandHandler<AuthLoginCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly devicesService: DevicesService,
  ) { }

  async execute(command: AuthLoginCommand): Promise<boolean | { accessToken: string, refreshToken: string; }> {
    console.log(command);
    const user = await this.usersService.findByLoginOrEmail(command.loginOrEmail);
    if (!user) return false;
    const passwordHash = await this.authService.hashPassword(command.password, user.passwordSalt);
    if (user.passwordHash !== passwordHash) return false;
    const lastActiveDate = new Date().getTime();
    console.log(lastActiveDate);
    const device = await this.devicesService.create(command.device.ip, command.device.title, user._id.toString(), lastActiveDate);
    const accessToken = await this.authService.createToken({
      userId: user._id.toString(),
      login: user.login,
      deviceId: device.id,
      lastActiveDate: lastActiveDate
    });
    const refreshToken = await this.authService.createRefreshToken({
      userId: user._id.toString(),
      login: user.login,
      deviceId: device.id,
      lastActiveDate: lastActiveDate
    });
    return { accessToken, refreshToken };
  }
}