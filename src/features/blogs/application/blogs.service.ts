import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsRepository: PostsRepository,
  ) { }

  async create(
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<string> {

    const newBlog: any = {
      name: name,
      description: description,
      websiteUrl: websiteUrl,
      createdAt: new Date(),
    };

    const createdBlogId: string = await this.blogsRepository.create(newBlog);

    return createdBlogId;
  }

  async update(
    id,
    updateModel
  ): Promise<any> {

    const updatedResult = await this.blogsRepository.update(id, updateModel);
    console.log(updatedResult, 'service');
    return true;
  }

  async delete(id: string): Promise<boolean> {
    return this.blogsRepository.delete(id);
  }
}
