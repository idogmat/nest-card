import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentOutputModel, CommentOutputModelMapper } from '../api/model/output/comment.output.model';
import { Comment } from '../domain/comment.entity';
import { Post } from '../../posts/domain/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
  ) { }
  async create(
    post: Post,
    content: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentOutputModel> {
    if (!post) throw new NotFoundException();
    const newComment: any = {
      postId: post.id,
      content,
      userId,
      userLogin,
      createdAt: new Date()
    };

    const commentId = await this.commentsRepository.create(newComment);
    if (!commentId) throw new NotFoundException();
    const comment = await this.commentsRepository.getById(commentId);
    if (!comment) throw new NotFoundException();
    return CommentOutputModelMapper(comment);
  }

  async setLike(
    id,
    user,
    likeStatus,
  ): Promise<string> {

    const result = await this.commentsRepository.setLike(id, user, likeStatus);
    return result;
  }


  async getById(
    id,
  ): Promise<Comment | null> {
    const result = await this.commentsRepository.getById(id);
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
