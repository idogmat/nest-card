import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import bcrypt from 'bcrypt';
import { UserAuthInput } from './../../../features/auth/api/model/input/auth.input.model';
import { User } from '../domain/user.entity';

// Для провайдера всегда необходимо применять декоратор @Injectable() и регистрировать в модуле
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
  ) { }

  async create(
    login: string,
    password: string,
    email: string,
  ): Promise<string> {
    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, passwordSalt);

    const newUser = {
      login,
      passwordHash,
      passwordSalt,
      email,
    } as UserAuthInput;

    const createdUserId: string = await this.usersRepository.create(newUser);

    return createdUserId;
  }

  async delete(id: string): Promise<boolean> {
    return this.usersRepository.delete(id);
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findByEmail(email);
  }
  async findByRecoveryCode(recoveryCode: string) {
    return await this.usersRepository.findByRecoveryCode(recoveryCode);
  }
  async findByLoginAndEmail(login: string, email: string) {
    return await this.usersRepository.findByLoginAndEmail(login, email);
  }
  async getById(id: string) {
    return await this.usersRepository.getById(id);
  }

  async getUsersByIds(ids: string[]) {
    const users = await this.usersRepository.getUsersByIds(ids);
    return users.reduce((acc, u) => {
      if (u.tgId) acc.push(u.tgId)
      return acc
    }, [])
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    return await this.usersRepository.findByLoginOrEmail(loginOrEmail);
  }

  async saveModel(user: User) {
    return await this.usersRepository.save(user);
  }
}
