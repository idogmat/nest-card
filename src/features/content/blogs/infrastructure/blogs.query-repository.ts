import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogOutputModel, BlogOutputModelMapper } from '../api/model/output/blog.output.model';
import { PaginationOutput, PaginationWithSearchBlogNameTerm } from 'src/base/models/pagination.base.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../domain/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepo: Repository<Blog>,
  ) { }

  async getById(id: string): Promise<BlogOutputModel | null> {
    const blog = await this.blogRepo.findOneBy({ id: id });
    if (!blog || blog.bannedByAdmin) {
      throw new NotFoundException();
    }
    return BlogOutputModelMapper(blog);
  }

  async getAll(
    pagination: PaginationWithSearchBlogNameTerm,
  ): Promise<PaginationOutput<BlogOutputModel>> {
    const conditions = [];
    const params = [];
    if (pagination.searchNameTerm) {
      conditions.push("b.name ilike :name");
      params.push({ name: `%${pagination.searchNameTerm}%` });
    }

    const blogQueryBuilder = this.blogRepo.createQueryBuilder("b")
      .where(`b."bannedByAdmin" != :banned`, { banned: true });

    if (conditions.length > 0) {
      conditions.forEach((condition, i) => blogQueryBuilder.andWhere(condition, params[i]));
    }
    // const sql = blogsQueryBuilder.getSql();

    const totalCount = await blogQueryBuilder.getCount();

    const blogs = await blogQueryBuilder
      .orderBy(`b.${pagination.sortBy}`, pagination.sortDirection)
      .take(pagination.pageSize)
      .skip((pagination.pageNumber - 1) * pagination.pageSize)
      .getMany();

    const mappedBlogs = blogs.map(BlogOutputModelMapper);

    return new PaginationOutput<BlogOutputModel>(
      mappedBlogs,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
  }
}
