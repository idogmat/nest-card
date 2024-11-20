import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { Blog } from "src/features/content/blogs/domain/blog.entity";
import { User } from "src/features/users/domain/user.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(Blog)
    private readonly bloggerRepo: Repository<Blog>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }

  async getById(id: string): Promise<Blog | null> {
    const blog = await this.bloggerRepo.findOneBy({ id: id });
    if (!blog) {
      return null;
    }
    return blog;
  }

  async create(newBlog: Blog): Promise<string> {
    const blog = this.bloggerRepo.create({
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt || new Date().toISOString(),
      isMembership: newBlog.isMembership || false,
    });
    const savedBlog = await this.bloggerRepo.save(blog);
    return savedBlog.id;
  }

  async bindUserWithBlog(blogId: string, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const [blog, user] = await Promise.all([
      queryRunner.manager.createQueryBuilder(Blog, 'b')
        .where('b.id = :blogId', { blogId })
        .getOne(),
      queryRunner.manager.createQueryBuilder(User, 'u')
        .where('u.id = :userId', { userId })
        .getOne()
    ]);
    if (!blog || blog?.userId || !user?.id) throw new BadRequestException();

    const updated = await queryRunner.manager.createQueryBuilder(Blog, 'b')
      .update(Blog)
      .set({
        userId
      })
      .where('id = :id', { id: blogId })
      .execute();
    return updated.affected;
  }
}