import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comment.entity';
import { CommentOutputModel, CommentOutputModelMapper } from '../api/model/output/comment.output.model';
import { Pagination, PaginationOutput } from 'src/base/models/pagination.base.model';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  async getById(id: string, userId?: string): Promise<CommentOutputModel | null> {
    const res = await this.dataSource.query(`
      SELECT *
	    FROM public.comment_pg
      WHERE id = $1;
      `, [id]);

    if (!res[0]) {
      return null;
    }
    return CommentOutputModelMapper(res[0], userId);
  }

  async getAll(
    pagination: Pagination,
    id: string,
    userId?: string
  ): Promise<PaginationOutput<CommentOutputModel>> {
    const conditions = [];
    const params = [];

    const totalCount = await this.dataSource.query(`
      SELECT COUNT(*)
      FROM public.comment_pg
      WHERE "postId" = $1
      `, [id]);

    const comments = await this.dataSource.query(`
      SELECT *
      FROM public.comment_pg
      WHERE "postId" = $1
      ORDER BY "${pagination.sortBy}" ${pagination.sortDirection}
      LIMIT $2 OFFSET $3;
      `, [id, pagination.pageSize,
      (pagination.pageNumber - 1) * pagination.pageSize]);
    console.log(comments);
    const mappedComments = comments.map(e => CommentOutputModelMapper(e, userId));

    return new PaginationOutput<CommentOutputModel>(
      mappedComments,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount[0].count),
    );
  }
}
