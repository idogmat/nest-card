import { Injectable } from '@nestjs/common';
import { BlogPg } from '../domain/blog.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(BlogPg)
    private readonly blogRepo: Repository<BlogPg>,
  ) { }

  async getById(id: string): Promise<BlogPg | null> {
    const user = await this.blogRepo.findOneBy({ id: id });
    if (!user) {
      return null;
    }
    return user;
  }

  async create(newBlog: BlogPg): Promise<string> {
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

  async update(id: string, newModel: BlogPg) {
    const updated = await this.blogRepo.createQueryBuilder()
      .update(BlogPg)
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
