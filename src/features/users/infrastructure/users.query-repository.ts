import { Injectable } from '@nestjs/common';
import {
  UserOutputModel,
  UserOutputModelMapper,
} from '../api/models/output/user.output.model';
import {
  PaginationOutput,
  PaginationWithSearchLoginAndEmailTerm,
} from '../../../base/models/pagination.base.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  async getById(id: string): Promise<UserOutputModel | null> {
    const user = await this.dataSource.query(`
      SELECT *
	    FROM public.user_pg
      WHERE id = $1
      `, [id]);
    if (user[0] === null) {
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

  // private async __getResult(
  //   filter: FilterQuery<User>,
  //   pagination: PaginationWithSearchLoginAndEmailTerm,
  // ): Promise<PaginationOutput<UserOutputModel>> {
  //   const users: UserDBModel = await this.userModel
  //     .find(filter)
  //     .sort({
  //       [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
  //     })
  //     .skip(pagination.getSkipItemsCount())
  //     .limit(pagination.pageSize);

  //   const totalCount = await this.userModel.countDocuments(filter);

  //   const mappedUsers = users.map(UserOutputModelMapper);

  //   return new PaginationOutput<UserOutputModel>(
  //     mappedUsers,
  //     pagination.pageNumber,
  //     pagination.pageSize,
  //     totalCount,
  //   );
  // }
}
