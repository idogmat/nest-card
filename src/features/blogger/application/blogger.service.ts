import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthUser } from "src/features/auth/auth.module";
import { BlogCreateModel } from "src/features/content/blogs/api/model/input/create-blog.input.model";
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

  async updateBlog(id: string, userId: string, newModel: BlogCreateModel) {
    const blog = await this.bloggerRepo.findOneBy({ id: id });
    if (!blog?.id) throw new NotFoundException();
    if (blog?.userId !== userId) throw new ForbiddenException();
    await this.bloggerRepo.update({ id: id }, { ...newModel });
  }

  async deleteBlog(id: string, userId: string): Promise<boolean> {
    const blog = await this.bloggerRepo.findOneBy({ id: id });
    if (!blog?.id) throw new NotFoundException();
    if (blog?.userId !== userId) throw new ForbiddenException();
    const result = await this.bloggerRepo.delete({ id: id });
    return result.affected === 1;
  }
}