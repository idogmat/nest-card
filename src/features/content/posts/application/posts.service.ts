import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { BlogBlock } from '../../blogs/domain/blog.ban.entity';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    @InjectRepository(BlogBlock)
    private readonly blogBlockRepo: Repository<BlogBlock>,
  ) { }

  async create(
    blogId: string,
    content: string,
    shortDescription: string,
    title: string
  ): Promise<string> {

    const newPost: any = {
      blogId,
      content,
      shortDescription,
      title
    };

    const createdPostId: string = await this.postsRepository.create(newPost);

    return createdPostId;
  }

  async update(
    id,
    updateModel
  ): Promise<boolean> {

    await this.postsRepository.update(id, updateModel);
    return true;
  }

  async setLike(
    id,
    user,
    likeStatus,
  ): Promise<string> {

    const result = await this.postsRepository.setLike(id, user, likeStatus);
    return result;
  }

  async getById(id: string) {
    return await this.postsRepository.getById(id);
  }

  async checkBlog(userId: string, blogId: string) {
    try {
      const blocked = await this.blogBlockRepo.createQueryBuilder('bb')
        .where(
          `bb.blockedByUserId = :userId AND bb.blogId = :blogId`,
          { userId, blogId }
        )
        .getOne();
      return blocked;
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    return await this.postsRepository.delete(id);
  }
}
