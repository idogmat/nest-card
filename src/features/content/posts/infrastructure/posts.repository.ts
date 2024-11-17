import { Injectable } from '@nestjs/common';
import { PostPg } from '../domain/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeType, PostLikePg } from './../../../../features/likes/domain/post-like-info.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(PostPg)
    private readonly postRepo: Repository<PostPg>,
    @InjectRepository(PostLikePg)
    private readonly postlikeRepo: Repository<PostLikePg>
  ) { }

  async create(newPost: PostPg): Promise<string> {
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
    const post = await this.postRepo.findOneBy({ id: id });
    return post;
  }

  async update(id: string, newModel: PostPg) {
    const updated = await this.postRepo.createQueryBuilder()
      .update(PostPg)
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
