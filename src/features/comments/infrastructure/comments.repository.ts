import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(Comment.name) private commentModel: CommentModelType) { }

  // async getById(id: string): Promise<CommentOutputModel | null> {
  //   const blog = await this.commentModel.findOne({ _id: id });

  //   if (blog === null) {
  //     return null;
  //   }

  //   return CommentOutputModelMapper(blog);
  // }
}
