import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AppSettings } from '../../../settings/app-settings';

@Injectable()
export class AuthService {
  constructor(private readonly appSettings: AppSettings) {}
  async generatePasswordHash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.appSettings.api.HASH_ROUNDS);
  }
}
