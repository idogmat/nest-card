import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comment.entity';
import { CommentOutputModel, CommentOutputModelMapper } from '../api/model/output/comment.output.model';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectModel(Comment.name) private commentModel: CommentModelType) { }

  async getById(id: string): Promise<CommentOutputModel | null> {
    const comment = await this.commentModel.findOne({ _id: id });

    if (comment === null) {
      return null;
    }

    return CommentOutputModelMapper(comment);
  }

}
