import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EmailConfirmation, User, UserDocument, UserModelType } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) { }

  async create(newUser: User): Promise<string> {
    const model = await this.UserModel.create(newUser);
    await model.save();
    return model.id;
  }

  async getById(id: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findById(id);

    if (user === null) {
      return null;
    }

    return user;
  }

  async delete(id: string): Promise<boolean> {
    const deletingResult = await this.UserModel.deleteOne({ _id: id });

    return deletingResult.deletedCount === 1;
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const model = await this.UserModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
    return model;
  }

  async findByLoginAndEmail(login: string, email: string) {
    const model = await this.UserModel.findOne({
      $or: [{ email: email }, { login: login }],
    });
    return model;
  }

  async findByLogin(login: string) {
    const model = await this.UserModel.findOne({ login: login });
    return model;
  }

  async findByEmail(email: string) {
    const model = await this.UserModel.findOne({ email: email });
    return model;
  }

  async setRecoveryCode(id: string, recoveryCode: string) {
    const model = await this.UserModel.findById(id);
    model.recoveryCode = recoveryCode;
    model.save();
    return model;
  }

  async findByRecoveryCode(recoveryCode: string) {
    const model = await this.UserModel.findOne({ recoveryCode: recoveryCode });
    return model;
  }

  async findByConfirmCode(confirmationCode: string) {
    const model = await this.UserModel.findOne({ 'emailConfirmation.confirmationCode': confirmationCode });
    return model;
  }

  async setNewPassword(id: string, passwordHash: string) {
    const user = await this.UserModel.findById(id);
    user.passwordHash = passwordHash;
    user.recoveryCode = null;
    user.save();
  }

  async setConfirmRegistrationCode(id: string, emailConfirmation: EmailConfirmation) {
    const model = await this.UserModel.findById(id);
    model.emailConfirmation = emailConfirmation;
    model.save();
    return model;
  }

  async _clear() {
    await this.UserModel.deleteMany({});
  }

}
