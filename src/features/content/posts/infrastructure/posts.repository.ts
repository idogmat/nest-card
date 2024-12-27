import { Injectable } from '@nestjs/common';
import { Post } from '../domain/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeType, PostLike } from './../../../../features/likes/domain/post-like-info.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postlikeRepo: Repository<PostLike>
  ) { }

  async create(newPost: Post): Promise<string> {
    const post = this.postRepo.create({
      title: newPost.title,
      content: newPost.content,
      shortDescription: newPost.shortDescription,
      blogId: newPost.blogId,
      createdAt: newPost.createdAt || new Date(),
    });

    const savedPost = await this.postRepo.save(post);
    return savedPost.id;
  }

  async getById(id: string) {
    console.log('k');
    const post = await this.postRepo.findOneBy({ id: id });
    console.log('pst');
    return post;
  }

  async update(id: string, newModel: Post) {
    const updated = await this.postRepo.createQueryBuilder()
      .update(Post)
      .set({
        title: newModel.title,
        content: newModel.content,
        shortDescription: newModel.shortDescription
      })
      .where("id = :id", { id })
      .returning("*")
      .execute();
    return updated.raw[0];
  }

  async setLike(id: string, user: { userId: string, login: string; }, like: LikeType) {
    const postLike = await this.postlikeRepo.findOneBy({ postId: id, userId: user.userId });
    if (postLike) {
      postLike.type = like;
      postLike.addedAt = new Date();
      await this.postlikeRepo.save(postLike);
      return postLike.id;
    } else {
      const createPostLike = this.postlikeRepo.create({
        login: user.login,
        postId: id,
        userId: user.userId,
        type: like,
        addedAt: new Date(),
      });
      const savedPostLike = await this.postlikeRepo.save(createPostLike);
      return savedPostLike.id;
    }
  }

  async delete(id: string): Promise<boolean> {
    const post = await this.postRepo.delete({ id: id });
    return post.affected === 1;
  };
}
