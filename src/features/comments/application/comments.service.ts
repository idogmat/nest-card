import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentOutputModel, CommentOutputModelMapper } from '../api/model/output/comment.output.model';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
  ) { }
  async create(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentOutputModel> {

    const newComment: any = {
      postId,
      content,
      commentatorInfo: {
        userId,
        userLogin
      },
      createdAt: new Date().getTime()
    };

    const comment = await this.commentsRepository.create(newComment);

    return CommentOutputModelMapper(comment);
  }
}
