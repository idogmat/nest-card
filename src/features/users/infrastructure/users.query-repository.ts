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
    const user = await this.usersRepo.findBy({ id: id });
    if (!user?.[0]) {
      return null;
    }
    return UserOutputModelMapper(user[0]);
  }

  async getAll(
    pagination: PaginationWithSearchLoginAndEmailTerm,
  ): Promise<PaginationOutput<UserOutputModel>> {

    const conditions = [];
    const params = [];
    if (pagination.searchLoginTerm) {
      conditions.push(`login ILIKE $${params.length + 1}`);
      params.push(`%${pagination.searchLoginTerm}%`);
    }

    if (pagination.searchEmailTerm) {
      conditions.push(`email ILIKE $${params.length + 1}`);
      params.push(`%${pagination.searchEmailTerm}%`);
    }

    const totalCount = await this.dataSource.query(`
      SELECT COUNT(*)
      FROM public.user_pg
      ${conditions.length > 0 ? 'WHERE ' + conditions.join(' OR ') : ''};
      `, conditions.length > 0 ? params : []);
    const users = await this.dataSource.query(`
      SELECT *
      FROM public.user_pg
      ${conditions.length > 0 ? 'WHERE ' + conditions.join(' OR ') : ''}
      ORDER BY "${pagination.sortBy}" ${pagination.sortDirection}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
      `,
      conditions.length > 0
        ? [...params, pagination.pageSize,
        (pagination.pageNumber - 1) * pagination.pageSize]
        : [pagination.pageSize,
        (pagination.pageNumber - 1) * pagination.pageSize]
    );
    const mappedUsers = users.map(UserOutputModelMapper);
    return new PaginationOutput<UserOutputModel>(
      mappedUsers,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount[0].count),
    );
  }
}
