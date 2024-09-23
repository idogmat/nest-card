import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
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
  ): Promise<boolean> {

    const result = await this.postsRepository.setLike(id, user, likeStatus);
    return result;
  }

  async getById(id: string) {
    return this.postsRepository.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    return this.postsRepository.delete(id);
  }
}
