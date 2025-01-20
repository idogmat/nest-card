import { Injectable } from '@nestjs/common';
import {
  UserOutputModel,
  UserOutputModelMapper,
} from '../api/models/output/user.output.model';
import {
  PaginationOutput,
  PaginationWithSearchLoginAndEmailTerm,
} from '../../../base/models/pagination.base.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
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
    let searchTerm = '';
    const userQueryBuilder = this.usersRepo.createQueryBuilder("u");

    const validNullParam = (param: string | null) => (param === null ? '' : param);
    if (pagination.searchLoginTerm) {
      conditions.push(`u.login ilike :login`);
      userQueryBuilder.setParameter('login', `%${validNullParam(pagination.searchLoginTerm)}%`);
    }
    if (pagination.searchEmailTerm) {
      conditions.push(`u.email ilike :email`);
      userQueryBuilder.setParameter('email', `%${validNullParam(pagination.searchEmailTerm)}%`);
    }

    userQueryBuilder.where(`u.banned ${pagination.banStatus === null ? 'IS NOT NULL' : '= ' + pagination.banStatus}`);
    if (conditions.length) {
      searchTerm = conditions.join(' OR ');
      userQueryBuilder.andWhere(searchTerm);
    }

    const totalCount = await userQueryBuilder.getCount();

    const users = await userQueryBuilder
      .orderBy(`u.${pagination.sortBy}`, pagination.sortDirection)
      .take(pagination.pageSize)
      .skip((pagination.pageNumber - 1) * pagination.pageSize)
      .getMany();
    // console.log(users);
    const mappedUsers = users.map(UserOutputModelMapper);
    return new PaginationOutput<UserOutputModel>(
      mappedUsers,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
  }
}
