import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAuthInput } from './../../../features/auth/api/model/input/auth.input.model';
import { User } from '../domain/user.entity';
import { EmailConfirmation } from '../api/models/input/create-user.input.model';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) { }

  async create(newUser: UserAuthInput): Promise<string> {
    const user = this.usersRepo.create({
      login: newUser.login,
      email: newUser.email,
      passwordHash: newUser.passwordHash,
      passwordSalt: newUser.passwordSalt,
      createdAt: new Date(),
      confirmationCode: '',
      expirationDate: null,
      isConfirmed: false,
    });

    const savedUser = await this.usersRepo.save(user);
    return savedUser.id;
  }

  async getById(id: string): Promise<User | null> {
    const user = await this.usersRepo.findOneBy({ id: id });
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.usersRepo.delete({ id: id });
    return user.affected === 1;
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const user = await this.usersRepo.createQueryBuilder("u")
      .where("u.login = :loginOrEmail", { loginOrEmail })
      .orWhere("u.email = :loginOrEmail", { loginOrEmail })
      .getOne();
    return user;
  }

  async findByLoginAndEmail(login: string, email: string) {
    const user = await this.usersRepo.createQueryBuilder("u")
      .where("u.login = :login", { login })
      .andWhere("u.email = :email", { email })
      .getOne();

    return user;
  }

  async findByLogin(login: string) {
    const user = await this.usersRepo.createQueryBuilder("u")
      .where("u.login = :login", { login })
      .getOne();
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.usersRepo.createQueryBuilder("u")
      .where("u.email = :email", { email })
      .getOne();
    return user;
  }

  async setRecoveryCode(id: string, recoveryCode: string) {
    const updated = await this.usersRepo.createQueryBuilder()
      .update(User)
      .set({ recoveryCode })
      .where("id = :id", { id })
      .returning("*")
      .execute();
    return updated.raw;
  }

  async findByRecoveryCode(recoveryCode: string) {
    const user = await this.usersRepo.createQueryBuilder("u")
      .where("u.recoveryCode = :recoveryCode", { recoveryCode })
      .getOne();
    return user;
  }

  async findByConfirmCode(confirmationCode: string) {
    const user = await this.usersRepo.createQueryBuilder("u")
      .where("u.confirmationCode = :confirmationCode", { confirmationCode })
      .getOne();
    return user;
  }

  async setNewPassword(id: string, passwordHash: string) {
    const updated = await this.usersRepo.createQueryBuilder()
      .update(User)
      .set({ passwordHash })
      .where("id = :id", { id })
      .returning("*")
      .execute();
    return updated.raw;
  }

  async setConfirmRegistrationCode(id: string, emailConfirmation: EmailConfirmation) {
    const updated = await this.usersRepo.createQueryBuilder()
      .update(User)
      .set({
        confirmationCode: emailConfirmation.confirmationCode,
        expirationDate: emailConfirmation.expirationDate,
        isConfirmed: emailConfirmation.isConfirmed
      })
      .where("id = :id", { id })
      .returning("id")
      .execute();
    return updated.raw;
  }
}
