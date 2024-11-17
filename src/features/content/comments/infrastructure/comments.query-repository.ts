import { Injectable } from '@nestjs/common';
import { CommentOutputModel, CommentOutputModelMapper } from '../api/model/output/comment.output.model';
import { Pagination, PaginationOutput } from 'src/base/models/pagination.base.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentPg } from '../domain/comment.entity';
import { CommentLikePg } from 'src/features/likes/domain/comment-like-info.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(CommentPg)
    private readonly commentRepo: Repository<CommentPg>,
    @InjectRepository(CommentLikePg)
    private readonly commentLikeRepo: Repository<CommentLikePg>,
  ) { }

  async getById(id: string, userId?: string): Promise<CommentOutputModel | null> {
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
          .from(CommentLikePg, "cl")
          .where("cl.commentId = c.id");
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

    const commentQueryBuilder = this.commentRepo.createQueryBuilder("c")
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
          .from(CommentLikePg, "cl")
          .where("cl.commentId = c.id");
      }, "extendedLikesInfo")
      .where("c.postId = :postId", { postId });

    const totalCount = await commentQueryBuilder.getCount();
    const comments = await commentQueryBuilder
      .orderBy(`"${pagination.sortBy}"`, pagination.sortDirection)
      .limit(pagination.pageSize)
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .getRawMany();

    console.log(comments);
    // const totalCount = await this.dataSource.query(`
    //   SELECT COUNT(*)
    //   FROM public.comment_pg
    //   WHERE "postId" = $1
    //   `, [postId]);

    // const comments = await this.dataSource.query(`
    //   SELECT c.*,
    //   (SELECT jsonb_agg(json_build_object(
    //     'userId', cl."userId",
    //     'login', cl.login,
    //     'like', cl.type,
    //     'addedAt', cl."addedAt"
    //   ) ORDER BY cl."addedAt" DESC ) 
    //   FROM public.comment_like_pg as cl WHERE c.id = cl."commentId") as "extendedLikesInfo"
    //   FROM public.comment_pg as c
    //   WHERE "postId" = $1
    //   ORDER BY "${pagination.sortBy}" ${pagination.sortDirection}
    //   LIMIT $2 OFFSET $3;
    //   `, [postId, pagination.pageSize,
    //   (pagination.pageNumber - 1) * pagination.pageSize]);
    const mappedComments = comments.map(e => CommentOutputModelMapper(e, userId));

    return new PaginationOutput<CommentOutputModel>(
      mappedComments,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
  }
}
