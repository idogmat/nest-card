import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';
import { isValidObjectId } from 'mongoose';

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
    updateModel,
  ): Promise<boolean> {

    if (!isValidObjectId(id)) return null;
    // const blogEntity = await this.blogsRepository.getById(id)

    const blog = await this.blogsRepository.update(id, updateModel);

    if (!blog) return null;

    return true;
  }

  async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return null;
    // const blogEntity = await this.blogsRepository.getById(id)

    return this.blogsRepository.delete(id);
  }
}
