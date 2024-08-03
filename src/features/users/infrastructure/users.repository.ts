import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) { }

  async create(newUser: User): Promise<string> {
    const model = await this.UserModel.create(newUser);
    await model.save();
    return model._id.toString();
  }

  async delete(id: string): Promise<boolean> {
    const deletingResult = await this.UserModel.deleteOne({ _id: id });

    return deletingResult.deletedCount === 1;
  }
}
