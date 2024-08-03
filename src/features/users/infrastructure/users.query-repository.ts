import { Injectable } from '@nestjs/common';
import {
  UserOutputModel,
  UserOutputModelMapper,
} from '../api/models/output/user.output.model';
import { User, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  PaginationOutput,
  PaginationWithSearchLoginAndEmailTerm,
} from '../../../base/models/pagination.base.model';
import { FilterQuery } from 'mongoose';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: UserModelType) {}

  async getById(id: string): Promise<UserOutputModel | null> {
    const user = await this.userModel.findOne({ _id: id });

    if (user === null) {
      return null;
    }

    return UserOutputModelMapper(user);
  }

  async getAll(
    pagination: PaginationWithSearchLoginAndEmailTerm,
  ): Promise<PaginationOutput<UserOutputModel>> {
    const filters: FilterQuery<User>[] = [];

    if (pagination.searchEmailTerm) {
      filters.push({
        email: { $regex: pagination.searchEmailTerm, $options: 'i' },
      });
    }

    if (pagination.searchLoginTerm) {
      filters.push({
        login: { $regex: pagination.searchLoginTerm, $options: 'i' },
      });
    }

    const filter: FilterQuery<User> = {};

    if (filters.length > 0) {
      filter.$or = filters;
    }

    return await this.__getResult(filter, pagination);
  }

  private async __getResult(
    filter: FilterQuery<User>,
    pagination: PaginationWithSearchLoginAndEmailTerm,
  ): Promise<PaginationOutput<UserOutputModel>> {
    const users = await this.userModel
      .find(filter)
      .sort({
        [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
      })
      .skip(pagination.getSkipItemsCount())
      .limit(pagination.pageSize);

    const totalCount = await this.userModel.countDocuments(filter);

    const mappedPosts = users.map(UserOutputModelMapper);

    return new PaginationOutput<UserOutputModel>(
      mappedPosts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }
}
