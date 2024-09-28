import { Injectable } from '@nestjs/common';
import { Comment } from '../domain/comment.entity';
import { LikeType } from 'src/features/likes/domain/like-info.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
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
    const updated = await this.dataSource.query(`
      INSERT INTO public.comment_like_pg (
      "userId",
      "login",
      "commentId",
      "type",
      "addedAt"
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("userId", "commentId") 
      DO UPDATE SET "type" = $4, "addedAt" = $5, "login" = $2
      RETURNING id;`, [
      user.userId,
      user.login,
      id,
      like,
      new Date().getTime()
    ]);
    return updated[0];
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.dataSource.query(`
      DELETE FROM public.comment_pg
      WHERE id = $1;
      `, [id]);

    return res[1] === 1;
  };

  async update(id: string, newModel: Comment) {
    const updated = await this.dataSource.query(`
      UPDATE public.comment_pg
      SET "content" = $2
      WHERE id = $1 RETURNING * ;
      `, [
      id,
      newModel.content,
    ]);
    return updated[0];
  }
}
