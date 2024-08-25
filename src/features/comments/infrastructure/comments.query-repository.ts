import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comment.entity';
import { CommentOutputModel, CommentOutputModelMapper } from '../api/model/output/comment.output.model';
import { Pagination, PaginationOutput } from 'src/base/models/pagination.base.model';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectModel(Comment.name) private CommentModel: CommentModelType) { }

  async getById(id: string): Promise<CommentOutputModel | null> {
    const comment = await this.CommentModel.findById(id);

    if (comment === null) {
      return null;
    }

    return CommentOutputModelMapper(comment);
  }

  async getAll(
    pagination: Pagination,
    id: string,
    userId?: string
  ): Promise<PaginationOutput<CommentOutputModel>> {
    const blogs = await this.CommentModel
      .find({ postId: id })
      .sort({
        [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
      })
      .skip(pagination.getSkipItemsCount())
      .limit(pagination.pageSize);

    const totalCount = await this.CommentModel.countDocuments({ postId: id });

    const mappedComments = blogs.map(e => CommentOutputModelMapper(e, userId));

    return new PaginationOutput<CommentOutputModel>(
      mappedComments,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }
}
