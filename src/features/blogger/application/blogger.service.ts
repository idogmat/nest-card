import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthUser } from "src/features/auth/auth.module";
import { Blog } from "src/features/content/blogs/domain/blog.entity";
import { Repository } from "typeorm";

@Injectable()
export class BloggerService {
  constructor(
    @InjectRepository(Blog)
    private readonly bloggerRepo: Repository<Blog>,
  ) { }

  async getById(id: string): Promise<Blog | null> {
    const blog = await this.bloggerRepo.findOneBy({ id: id });
    if (!blog) {
      return null;
    }
    return blog;
  }

  async create(newBlog: Blog, user: AuthUser): Promise<string> {
    const blog = this.bloggerRepo.create({
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt || new Date().toISOString(),
      isMembership: newBlog.isMembership || false,
      userId: user.userId
    });
    const savedBlog = await this.bloggerRepo.save(blog);
    return savedBlog.id;
  }

  // async update(id: string, newModel: BlogPg) {
  //   const updated = await this.blogRepo.createQueryBuilder()
  //     .update(BlogPg)
  //     .set({
  //       name: newModel.name,
  //       description: newModel.description,
  //       websiteUrl: newModel.websiteUrl
  //     })
  //     .where("id = :id", { id })
  //     .returning("*")
  //     .execute();
  //   return updated.raw;
  // }

  // async delete(id: string): Promise<boolean> {
  //   const blog = await this.blogRepo.delete({ id: id });
  //   return blog.affected === 1;
  // }
}