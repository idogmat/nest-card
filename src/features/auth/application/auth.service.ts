import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AppSettings } from '../../../settings/app-settings';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/features/users/domain/user.entity';
import { randomUUID } from 'crypto';
import { dateSetter } from 'src/common/utils/dataSetter';
import { UsersRepository } from 'src/features/users/infrastructure/users.repository';


@Injectable()
export class AuthService {
  constructor(
    private readonly appSettings: AppSettings,
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService
  ) { }

  async generatePasswordHash(password: string): Promise<{ passwordHash, passwordSalt; }> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, passwordSalt);
    return {
      passwordHash,
      passwordSalt
    };
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    const passwordHash = await bcrypt.hash(password, salt);
    return passwordHash;
  }

  async registration(login: string, password: string, email: string) {
    const { passwordHash, passwordSalt } = await this.generatePasswordHash(password);
    const id = await this.usersRepository.create({ login, email, passwordHash, passwordSalt } as User);
    return id;
  }

  async login(loginOrEmail: string, password: string) {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) return false;
    const passwordHash = await this.hashPassword(password, user.passwordSalt);
    if (user.passwordHash !== passwordHash) return false;
    const access_token = await this.createToken({ userId: user._id.toString() });
    return access_token;
  }

  async createToken(payload: any) {
    const token = await this.jwtService.sign(
      payload,
      {
        secret: this.appSettings.api.ACCESS_SECRET_TOKEN,
        expiresIn: this.appSettings.api.ACCESS_SECRET_TOKEN_EXPIRATION
      }
    );
    return token;
  }

  async validateUser(loginOrEmail: string, password: string) {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) return false;
    const passwordHash = await this.hashPassword(password, user.passwordSalt);
    if (user.passwordHash !== passwordHash) return false;
    return user;
  }

  async setRecoveryCode(id: string) {
    const recoveryCode = randomUUID();
    await this.usersRepository.setRecoveryCode(id, recoveryCode);
    return recoveryCode;
  }

  async setNewPssword(id: string, newPassword: string, salt: string) {
    const passwordHash = await this.hashPassword(newPassword, salt);
    this.usersRepository.setNewPassword(id, passwordHash);
  }

  async setConfirmRegistrationCode(id: string, confirmed: boolean = false) {
    const emailConfirmation = {
      confirmationCode: randomUUID(),
      expirationDate: dateSetter(new Date(), {
        hours: 1,
        minutes: 30,
      }),
      isConfirmed: confirmed,
    };
    await this.usersRepository.setConfirmRegistrationCode(id, emailConfirmation);
    return emailConfirmation.confirmationCode;
  }

  async setConfirm(code: string) {
    const user = await this.usersRepository.findByConfirmCode(code);
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed || user.emailConfirmation.expirationDate < new Date()) return false;
    await this.setConfirmRegistrationCode(user.id, true);
    return true;
  }
}
