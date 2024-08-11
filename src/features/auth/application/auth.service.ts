import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AppSettings } from '../../../settings/app-settings';
import { UsersRepository } from 'src/features/users/infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/features/users/domain/user.entity';
import env from 'dotenv';
env.config();

const secret = process.env.ACCESS_SECRET_TOKEN || 'any';
const expiresIn = process.env.ACCESS_SECRET_TOKEN_EXPIRATION || '15m';

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

  async checkPassword(password: string, salt: string): Promise<string> {
    const passwordHash = await bcrypt.hash(password, salt);
    return passwordHash;
  }

  async registration(login: string, password: string, email: string) {
    const { passwordHash, passwordSalt } = await this.generatePasswordHash(password);
    this.usersRepository.create({ login, email, passwordHash, passwordSalt } as User);
  }

  async login(loginOrEmail: string, password: string) {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) return false;
    const passwordHash = await this.checkPassword(password, user.passwordSalt);
    if (user.passwordHash !== passwordHash) return false;
    const access_token = await this.createToken({ userId: user._id.toString() });
    return access_token;
  }

  async createToken(payload: any) {
    const token = await this.jwtService.sign(payload, { secret, expiresIn });
    return token;
  }

  async validateUser(loginOrEmail: string, password: string) {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) return false;
    const passwordHash = await this.checkPassword(password, user.passwordSalt);
    if (user.passwordHash !== passwordHash) return false;
    return user;
  }
}
