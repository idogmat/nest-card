import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
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
      createdAt: new Date().getTime(),
    };

    const createdBlogId: string = await this.blogsRepository.create(newBlog);

    return createdBlogId;
  }

  async update(
    id,
    updateModel,
  ): Promise<boolean> {
    const blogEntity = await this.blogsRepository.getById(id);
    if (!blogEntity) return null;
    const blog = await this.blogsRepository.update(id, updateModel);

    if (!blog) return null;

    return true;
  }

  async delete(id: string): Promise<boolean> {
    return this.blogsRepository.delete(id);
  }
}
