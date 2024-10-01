import { Injectable } from '@nestjs/common';
import { EmailConfirmation, User, UserDocument } from '../domain/user.entity';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  async create(newUser: User): Promise<string> {
    const res = await this.dataSource.query(`
      INSERT INTO public.user_pg (
      login, email,
      "passwordHash",
      "passwordSalt",
      "createdAt",
      "confirmationCode",
      "expirationDate",
      "isConfirmed"
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id;
      `, [
      newUser.login,
      newUser.email,
      newUser.passwordHash,
      newUser.passwordSalt,
      newUser.createdAt || new Date(),
      newUser.emailConfirmation?.confirmationCode || '',
      newUser.emailConfirmation?.expirationDate || null,
      newUser.emailConfirmation?.isConfirmed || false,
    ]);
    return res[0].id;
  }

  async getById(id: string): Promise<UserDocument | null> {
    const res = await this.dataSource.query(`
      SELECT *
	    FROM public.user_pg
      WHERE id = $1;
      `, [id]);

    if (!res[0]) {
      return null;
    }

    return res[0];
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.dataSource.query(`
      DELETE FROM public.user_pg
      WHERE id = $1;
      `, [id]);

    return res[1] === 1;
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const res = await this.dataSource.query(`
      SELECT * FROM public.user_pg
      WHERE login = $1 OR email = $2;
      `, [loginOrEmail, loginOrEmail]);
    return res[0];
  }

  async findByLoginAndEmail(login: string, email: string) {
    const res = await this.dataSource.query(`
      SELECT * FROM public.user_pg
      WHERE login = $1 AND email = $2;
      `, [login, email]);
    return res[0];
  }

  async findByLogin(login: string) {
    const res = await this.dataSource.query(`
      SELECT * FROM public.user_pg
      WHERE login = $1;
      `, [login]);
    return res[0];
  }

  async findByEmail(email: string) {
    const res = await this.dataSource.query(`
      SELECT * FROM public.user_pg
      WHERE email = $1;
      `, [email]);
    return res[0];
  }

  async setRecoveryCode(id: string, recoveryCode: string) {
    const updated = await this.dataSource.query(`
      UPDATE public.user_pg
      SET "recoveryCode" = $1
      WHERE id = $2 RETURNING * ;
      `, [recoveryCode, id]);
    return updated[0];
  }

  async findByRecoveryCode(recoveryCode: string) {
    const res = await this.dataSource.query(`
      SELECT * FROM public.user_pg
      WHERE "recoveryCode" = $1;
      `, [recoveryCode]);
    return res[0];
  }

  async findByConfirmCode(confirmationCode: string) {
    const res = await this.dataSource.query(`
      SELECT * FROM public.user_pg
      WHERE "confirmationCode" = $1;
      `, [confirmationCode]);
    return res[0];
  }

  async setNewPassword(id: string, passwordHash: string) {
    const updated = await this.dataSource.query(`
      UPDATE public.user_pg
      SET "passwordHash" = $1,
      "recoveryCode" = null
      WHERE id = $2;
      `, [passwordHash, id]);
    return updated[0];
  }

  async setConfirmRegistrationCode(id: string, emailConfirmation: EmailConfirmation) {

    const res = await this.dataSource.query(`
      UPDATE public.user_pg 
      SET "confirmationCode" = $1,
      "expirationDate" = $2,
      "isConfirmed" = $3
      WHERE id = $4 RETURNING id;
      `, [
      emailConfirmation.confirmationCode,
      emailConfirmation.expirationDate,
      emailConfirmation.isConfirmed,
      id,
    ]);
    console.log(res, 'congirmcode');
    return res[0].id;
  }
}
