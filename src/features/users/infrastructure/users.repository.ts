import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EmailConfirmation, User, UserDocument, UserModelType } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: UserModelType) { }

  async create(newUser: User): Promise<string> {
    const model = await this.userModel.create(newUser);
    await model.save();
    return model.id;
  }

  async getById(id: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id);

    if (user === null) {
      return null;
    }

    return user;
  }

  async delete(id: string): Promise<boolean> {
    const deletingResult = await this.userModel.deleteOne({ _id: id });

    return deletingResult.deletedCount === 1;
  }

  async findByLoginOrEmail(loginOrEmail: string) {
    const model = await this.userModel.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
    return model;
  }

  async findByLoginAndEmail(login: string, email: string) {
    const model = await this.userModel.findOne({
      $or: [{ email: email }, { login: login }],
    });
    return model;
  }

  async findByLogin(login: string) {
    const model = await this.userModel.findOne({ login: login });
    return model;
  }

  async findByEmail(email: string) {
    const model = await this.userModel.findOne({ email: email });
    return model;
  }

  async setRecoveryCode(id: string, recoveryCode: string) {
    const model = await this.userModel.findById(id);
    model.recoveryCode = recoveryCode;
    model.save();
    return model;
  }

  async findByRecoveryCode(recoveryCode: string) {
    const model = await this.userModel.findOne({ recoveryCode: recoveryCode });
    return model;
  }

  async findByConfirmCode(confirmationCode: string) {
    const model = await this.userModel.findOne({ 'emailConfirmation.confirmationCode': confirmationCode });
    return model;
  }

  async setNewPassword(id: string, passwordHash: string) {
    const user = await this.userModel.findById(id);
    user.passwordHash = passwordHash;
    user.recoveryCode = null;
    user.save();
  }

  async setConfirmRegistrationCode(id: string, emailConfirmation: EmailConfirmation) {
    const model = await this.userModel.findById(id);
    model.emailConfirmation = emailConfirmation;
    model.save();
    return model;
  }

}
