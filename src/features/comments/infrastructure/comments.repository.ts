import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument, CommentModelType } from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(Comment.name) private CommentModel: CommentModelType) { }

  async create(newComment: Comment): Promise<CommentDocument> {
    const model = await new this.CommentModel(newComment);
    await model.save();
    return model;
  }
}
