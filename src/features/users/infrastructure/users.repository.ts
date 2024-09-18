import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EmailConfirmation, User, UserDocument, UserModelType } from '../domain/user.entity';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  async create(newUser: User): Promise<string> {
    const res = await this.dataSource.query(`
      INSERT INTO public.user_pg (
      login, email,
      password_hash,
      password_salt,
      created_at,
      confirmation_code,
      expiration_date,
      is_confirmed
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id;
      `, [
      newUser.login,
      newUser.email,
      newUser.passwordHash,
      newUser.passwordSalt,
      newUser.createdAt || new Date().getTime(),
      newUser.emailConfirmation?.confirmationCode || '',
      newUser.emailConfirmation?.expirationDate || null,
      newUser.emailConfirmation?.isConfirmed || false,
    ]);
    return res[0].id;
  }

  async getById(id: number): Promise<UserDocument | null> {
    const res = await this.dataSource.query(`
      SELECT *
	    FROM public.user_pg
      WHERE id = $1;
      `, [id]);

    if (res === null) {
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
      SET recovery_code = $1
      WHERE id = $2 RETURNING * ;
      `, [recoveryCode, id]);
    return updated[0];
  }

  async findByRecoveryCode(recoveryCode: string) {
    const res = await this.dataSource.query(`
      SELECT * FROM public.user_pg
      WHERE recovery_code = $1;
      `, [recoveryCode]);
    return res[0];
  }

  async findByConfirmCode(confirmationCode: string) {
    const res = await this.dataSource.query(`
      SELECT * FROM public.user_pg
      WHERE confirmation_code = $1;
      `, [confirmationCode]);
    return res[0];
  }

  async setNewPassword(id: string, passwordHash: string) {
    const updated = await this.dataSource.query(`
      UPDATE public.user_pg
      SET password_hash = $1,
      recovery_code = null
      WHERE id = $2;
      `, [passwordHash, id]);
    return updated[0];
  }

  async setConfirmRegistrationCode(id: string, emailConfirmation: EmailConfirmation) {

    const res = await this.dataSource.query(`
      UPDATE public.user_pg 
      SET confirmation_code = $1,
      expiration_date = $2,
      is_confirmed = $3
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

  async _clear() {
    await this.UserModel.deleteMany({});
  }

}
