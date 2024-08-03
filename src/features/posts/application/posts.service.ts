import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
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

  async delete(id: string): Promise<boolean> {
    return this.postsRepository.delete(id);
  }
}
