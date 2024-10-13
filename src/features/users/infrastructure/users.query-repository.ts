import { Injectable } from '@nestjs/common';
import {
  UserOutputModel,
  UserOutputModelMapper,
} from '../api/models/output/user.output.model';
import {
  PaginationOutput,
  PaginationWithSearchLoginAndEmailTerm,
} from '../../../base/models/pagination.base.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserPg } from '../domain/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(UserPg)
    private readonly usersRepo: Repository<UserPg>,
  ) { }

  async getById(id: string): Promise<UserOutputModel | null> {
    const user = await this.usersRepo.findOneBy({ id: id });
    if (!user) {
      return null;
    }
    return UserOutputModelMapper(user);
  }

  async getAll(
    pagination: PaginationWithSearchLoginAndEmailTerm,
  ): Promise<PaginationOutput<UserOutputModel>> {

    const conditions = [];
    const params = [];
    console.log(pagination);
    const userQueryBuilder = this.usersRepo.createQueryBuilder("u");

    if (pagination.searchLoginTerm) {
      conditions.push("u.login ilike :login");
      params.push({ login: `%${pagination.searchLoginTerm}%` });
    }
    if (pagination.searchEmailTerm) {
      conditions.push("u.email ilike :email");
      params.push({ email: `%${pagination.searchEmailTerm}%` });
    }

    if (conditions.length > 0) {
      conditions.forEach((condition, i) => {
        if (i === 0)
          userQueryBuilder.where(condition, params[i]);
        if (i === 1)
          userQueryBuilder.andWhere(condition, params[i]);
      });
    }

    // console.log(userQueryBuilder.getSql());

    const totalCount = await userQueryBuilder.getCount();

    const users = await userQueryBuilder
      .orderBy(`u.${pagination.sortBy}`, pagination.sortDirection)
      .take(pagination.pageSize)
      .skip((pagination.pageNumber - 1) * pagination.pageSize)
      .getMany();

    const mappedUsers = users.map(UserOutputModelMapper);
    return new PaginationOutput<UserOutputModel>(
      mappedUsers,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
  }
}
