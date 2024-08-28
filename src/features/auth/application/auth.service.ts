import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/features/users/domain/user.entity';
import { randomUUID } from 'crypto';
import { dateSetter } from 'src/common/utils/dataSetter';
import { UsersRepository } from 'src/features/users/infrastructure/users.repository';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private jwtService: JwtService,
    private configService: ConfigService
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

  // async login(loginOrEmail: string, password: string): Promise<boolean | { accessToken: string, refreshToken: string; }> {
  //   const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
  //   if (!user) return false;
  //   const passwordHash = await this.hashPassword(password, user.passwordSalt);
  //   if (user.passwordHash !== passwordHash) return false;
  //   const accessToken = await this.createToken({ userId: user._id.toString(), login: user.login });
  //   const refreshToken = await this.createToken({ userId: user._id.toString(), login: user.login });
  //   return { accessToken, refreshToken };
  // }

  async createToken(payload: any) {
    // console.log(this.configService.get('ACCESS_SECRET_TOKEN'));
    const token = await this.jwtService.sign(
      payload,
      {
        secret: this.configService.get('ACCESS_SECRET_TOKEN'),
        expiresIn: this.configService.get('ACCESS_SECRET_TOKEN_EXPIRATION')
      }
    );
    return token;
  }

  async createRefreshToken(payload: any) {
    // console.log(this.configService.get('ACCESS_SECRET_TOKEN'));
    const token = await this.jwtService.sign(
      payload,
      {
        secret: this.configService.get('REFRESH_SECRET_TOKEN'),
        expiresIn: this.configService.get('REFRESH_SECRET_TOKEN_EXPIRATION')
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
