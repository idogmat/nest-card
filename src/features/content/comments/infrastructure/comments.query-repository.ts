import { Injectable } from '@nestjs/common';
import { CommentOutputModel, CommentOutputModelMapper } from '../api/model/output/comment.output.model';
import { Pagination, PaginationOutput } from 'src/base/models/pagination.base.model';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../domain/comment.entity';
import { CommentLike } from './../../../../features/likes/domain/comment-like-info.entity';
import { User } from 'src/features/users/domain/user.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }

  async getById(id: string, userId?: string): Promise<CommentOutputModel | null> {
    // const queryRunner = this.dataSource.createQueryRunner();
    // await queryRunner.connect();
    const comment = await this.commentRepo.createQueryBuilder("c")
      .select([
        "c.*",
      ])
      .addSelect((subQuery) => {
        return subQuery.select("COALESCE(" +
          "jsonb_agg(jsonb_build_object(" +
          "'userId', cl.userId, " +
          "'commentId', cl.commentId, " +
          "'type', cl.type, " +
          "'login', cl.login, " +
          "'addedAt', cl.addedAt" +
          ")) FILTER (WHERE cl.userId IS NOT NULL), '[]')")
          .from(CommentLike, "cl")
          .leftJoin(User, 'u', 'cl.userId IS NOT NULL AND u.id = cl.userId')
          .where("cl.commentId = c.id")
          .andWhere("u.banned != true");
      }, "extendedLikesInfo")
      .where("c.id = :id", { id })
      .getRawOne();

    if (!comment) {
      return null;
    }
    return CommentOutputModelMapper(comment, userId);
  }

  async getAll(
    pagination: Pagination,
    postId: string,
    userId?: string
  ): Promise<PaginationOutput<CommentOutputModel>> {
    const queryRunner = this.dataSource.createQueryRunner();
    const commentQueryBuilder = queryRunner.manager.createQueryBuilder(Comment, "c")
      .select([
        "c.*",
      ])
      .addSelect((subQuery) => {
        return subQuery.select("COALESCE(" +
          "jsonb_agg(jsonb_build_object(" +
          "'userId', cl.userId, " +
          "'commentId', cl.commentId, " +
          "'type', cl.type, " +
          "'login', cl.login, " +
          "'addedAt', cl.addedAt" +
          ")) FILTER (WHERE cl.userId IS NOT NULL), '[]')")
          .from(CommentLike, "cl")
          .leftJoin(User, 'u', 'cl.userId IS NOT NULL AND u.id = cl.userId')
          .where("cl.commentId = c.id")
          .andWhere("u.banned != true");
      }, "extendedLikesInfo")
      .where("c.postId = :postId", { postId });

    const totalCount = await commentQueryBuilder.getCount();
    const comments = await commentQueryBuilder
      .orderBy(`"${pagination.sortBy}"`, pagination.sortDirection)
      .limit(pagination.pageSize)
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .getRawMany();
    console.log(comments, 'comments');
    const mappedComments = comments.map(e => CommentOutputModelMapper(e, userId));

    return new PaginationOutput<CommentOutputModel>(
      mappedComments,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
  }
}
