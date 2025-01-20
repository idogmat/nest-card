import { AuthService } from "../auth.service";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DevicesService } from "./../../../../features/devices/application/devices.service";
import { UsersService } from "./../../../../features/users/application/users.service";

export class AuthLoginCommand {
  constructor(
    public readonly loginOrEmail: string,
    public readonly password: string,
    public readonly device: { ip: string, title: string; }
  ) { }
}

@CommandHandler(AuthLoginCommand)
export class AuthLoginUseCase implements ICommandHandler<AuthLoginCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly devicesService: DevicesService,
  ) { }

  async execute(command: AuthLoginCommand): Promise<boolean | { accessToken: string, refreshToken: string; }> {
    const user = await this.usersService.findByLoginOrEmail(command.loginOrEmail);
    if (!user || user.banned) return false;
    const passwordHash = await this.authService.hashPassword(command.password, user.passwordSalt);
    if (user.passwordHash !== passwordHash) return false;
    const lastActiveDate = new Date();
    console.log(command);
    const device = await this.devicesService.create(
      command.device.ip,
      command.device.title,
      user.id,
      lastActiveDate
    );
    const accessToken = await this.authService.createToken({
      userId: user.id,
      login: user.login,
      deviceId: device.id,
      lastActiveDate: lastActiveDate
    });
    const refreshToken = await this.authService.createRefreshToken({
      userId: user.id,
      login: user.login,
      deviceId: device.id,
      lastActiveDate: lastActiveDate
    });
    return { accessToken, refreshToken };
  }
}