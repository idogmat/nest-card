import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { LikeType } from 'src/features/likes/domain/like-info.entity';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  async create(newPost: Post): Promise<string> {
    const res = await this.dataSource.query(`
      INSERT INTO public.post_pg (
      title, 
      content,
      "shortDescription",
      "blogId",
      "createdAt"
      )
      VALUES ($1,$2,$3,$4,$5) RETURNING id;
      `, [
      newPost.title,
      newPost.content,
      newPost.shortDescription,
      newPost.blogId,
      newPost.createdAt || new Date().getTime(),
    ]);
    return res[0].id;
  }

  async getById(id: string) {

    const res = await this.dataSource.query(`
      SELECT *
	    FROM public.post_pg
      WHERE id = $1;
      `, [id]);

    if (!res[0]) {
      return null;
    }

    return res[0];
  }

  async update(id: string, newModel: Post) {
    const updated = await this.dataSource.query(`
      UPDATE public.post_pg
      SET title = $2, 
      "content" = $3,
      "shortDescription" = $4
      WHERE id = $1 RETURNING * ;
      `, [
      id,
      newModel.title,
      newModel.content,
      newModel.shortDescription
    ]);
    return updated[0];
  }

  async setLike(id: string, user: { userId: string, login: string; }, like: LikeType) {
    const updated = await this.dataSource.query(`
      INSERT INTO public.post_like_pg (
      "userId",
      "login",
      "postId",
      "type",
      "addedAt"
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("userId") 
      DO UPDATE SET "type" = $4, "addedAt" = $5, "login" = $2;
      `, [
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
      DELETE FROM public.post_pg
      WHERE id = $1;
      `, [id]);

    return res[1] === 1;
  };
}
