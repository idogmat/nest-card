import { Injectable } from '@nestjs/common';
import { Blog } from '../domain/blog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepo: Repository<Blog>,
  ) { }

  async getById(id: string): Promise<Blog | null> {
    const user = await this.blogRepo.findOneBy({ id: id });
    if (!user) {
      return null;
    }
    return user;
  }

  async create(newBlog: Blog): Promise<string> {
    const blog = this.blogRepo.create({
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt || new Date().toISOString(),
      isMembership: newBlog.isMembership || false,
    });
    const savedBlog = await this.blogRepo.save(blog);
    return savedBlog.id;
  }

  async update(id: string, newModel: Blog) {
    const updated = await this.blogRepo.createQueryBuilder()
      .update(Blog)
      .set({
        name: newModel.name,
        description: newModel.description,
        websiteUrl: newModel.websiteUrl
      })
      .where("id = :id", { id })
      .returning("*")
      .execute();
    return updated.raw;
  }

  async delete(id: string): Promise<boolean> {
    const blog = await this.blogRepo.delete({ id: id });
    return blog.affected === 1;
  }
}
