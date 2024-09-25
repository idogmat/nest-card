import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../domain/comment.entity';
import { LikeType } from 'src/features/likes/domain/like-info.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  async create(newComment: Comment): Promise<string> {
    const res = await this.dataSource.query(`
      INSERT INTO public.comment_pg (
      content,
      "postId",
      "createdAt",
      "userId",
      "userLogin"
      )
      VALUES ($1,$2,$3,$4,$5) RETURNING *;
      `, [
      newComment.content,
      newComment.postId,
      newComment.createdAt || new Date().getTime(),
      newComment.userId,
      newComment.userLogin,
    ]);
    return res[0].id;
  }

  async getById(id: string): Promise<Comment | null> {

    const res = await this.dataSource.query(`
      SELECT *
	    FROM public.comment_pg
      WHERE id = $1;
      `, [id]);

    if (!res[0]) {
      return null;
    }
    return res[0];
  };

  async setLike(id: string, user: { userId: string, login: string; }, like: LikeType) {
    const model = await this.CommentModel.findById(id);
    if (!model) return false;
    console.log(user, like);
    // model.extendedLikesInfo.additionalLikes.set(user.userId, like);
    await model.save();
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const deletingResult = await this.CommentModel.deleteOne({ _id: id });

    return deletingResult.deletedCount === 1;
  };

  async update(id: string, newModel: Comment) {
    const model = await this.CommentModel.findByIdAndUpdate({ _id: id }, { ...newModel });
    return model;
  }
}
