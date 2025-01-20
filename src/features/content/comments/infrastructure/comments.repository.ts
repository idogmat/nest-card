import { Injectable } from '@nestjs/common';
import { Comment } from '../domain/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentCreateModel } from '../api/model/input/create-comment.input.model';
import { CommentLike, LikeType } from './../../../../features/likes/domain/comment-like-info.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepo: Repository<CommentLike>,
  ) { }

  async create(newComment: Comment): Promise<string> {
    const comment = this.commentRepo.create({
      content: newComment.content,
      postId: newComment.postId,
      createdAt: newComment.createdAt || new Date(),
      userId: newComment.userId,
      userLogin: newComment.userLogin,
    });

    const savedComment = await this.commentRepo.save(comment);
    return savedComment.id;
  }

  async getById(id: string): Promise<Comment | null> {
    const comment = await this.commentRepo.findOneBy({ id: id });
    if (!comment) {
      return null;
    }
    return comment;
  };

  async setLike(id: string, user: { userId: string, login: string; }, like: LikeType) {
    const commentLike = await this.commentLikeRepo.findOneBy({ commentId: id, userId: user.userId });
    if (commentLike) {
      commentLike.type = like;
      commentLike.addedAt = new Date();
      await this.commentLikeRepo.save(commentLike);
      return commentLike.id;
    } else {
      const createcommentLike = this.commentLikeRepo.create({
        login: user.login,
        commentId: id,
        userId: user.userId,
        type: like,
        addedAt: new Date(),
      });
      const savedcommentLike = await this.commentLikeRepo.save(createcommentLike);
      return savedcommentLike.id;
    }

  }

  async delete(id: string): Promise<boolean> {
    const post = await this.commentRepo.delete({ id: id });
    return post.affected === 1;
  };

  async update(id: string, newModel: CommentCreateModel) {
    const updated = await this.commentRepo.createQueryBuilder()
      .update(Comment)
      .set({
        content: newModel.content,
      })
      .where("id = :id", { id })
      .returning("*")
      .execute();
    return updated.raw[0];
  };
};