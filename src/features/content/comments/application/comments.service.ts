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

  async setLike(
    id,
    user,
    likeStatus,
  ): Promise<boolean> {

    const result = await this.commentsRepository.setLike(id, user, likeStatus);
    return result;
  }

  async delete(id: string): Promise<boolean> {
    return this.commentsRepository.delete(id);
  }

  async update(
    id,
    updateModel
  ): Promise<boolean> {

    await this.commentsRepository.update(id, updateModel);
    return true;
  }
}
