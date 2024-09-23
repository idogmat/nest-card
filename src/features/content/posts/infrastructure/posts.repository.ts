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
    const model = await this.PostModel.findById(id);
    if (!model) return false;
    let index = -1;
    if (like === "Like") {
      model.extendedLikesInfo.newestLikes.forEach((el, i) => {
        if (el.userId === user.userId) {
          index = i;
        }
      });
      if (index === -1) {
        model.extendedLikesInfo.newestLikes.unshift({
          userId: user.userId,
          login: user?.login || "",
          addedAt: new Date().toISOString(),
        });
      }
    } else {
      model.extendedLikesInfo.newestLikes.forEach((el, i) => {
        if (el.userId === user.userId) {
          index = i;
        }
        if (index !== -1) {
          model.extendedLikesInfo.newestLikes.splice(index, 1);
        }
      });
    }
    model.extendedLikesInfo.additionalLikes.set(user.userId, like);
    await model.save();
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.dataSource.query(`
      DELETE FROM public.post_pg
      WHERE id = $1;
      `, [id]);

    return res[1] === 1;
  };
}
