import { UsersRepository } from "src/features/users/infrastructure/users.repository";
import { AuthService } from "../auth.service";
import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class AuthLoginCommand {
  constructor(
    public readonly loginOrEmail: string,
    public readonly password: string
  ) { }
  // async execute() { }
}

@CommandHandler(AuthLoginCommand)
@Injectable()
export class AuthLoginUseCase implements ICommandHandler<AuthLoginCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
  ) { }

  async execute(command: AuthLoginCommand): Promise<boolean | { accessToken: string, refreshToken: string; }> {
    const user = await this.usersRepository.findByLoginOrEmail(command.loginOrEmail);
    if (!user) return false;
    const passwordHash = await this.authService.hashPassword(command.password, user.passwordSalt);
    if (user.passwordHash !== passwordHash) return false;
    const accessToken = await this.authService.createToken({ userId: user._id.toString(), login: user.login });
    const refreshToken = await this.authService.createRefreshToken({ userId: user._id.toString(), login: user.login });
    return { accessToken, refreshToken };
  }
}