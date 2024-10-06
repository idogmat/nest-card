import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentOutputModel, CommentOutputModelMapper } from '../api/model/output/comment.output.model';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { CommentPg } from '../domain/comment.entity';
import { CommentLikePg } from 'src/features/likes/domain/comment-like-info.entity';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
  ) { }
  async create(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
  ): Promise<CommentOutputModel> {

    const post = await this.postsRepository.getById(postId);
    if (!post) throw new NotFoundException();
    const newComment: any = {
      postId,
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
  ): Promise<boolean> {

    const result = await this.commentsRepository.setLike(id, user, likeStatus);
    return result;
  }


  async getById(
    id,
  ): Promise<CommentPg & CommentLikePg | null> {
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
