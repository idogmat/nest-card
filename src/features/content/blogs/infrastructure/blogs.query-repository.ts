import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogOutputModel, BlogOutputModelMapper } from '../api/model/output/blog.output.model';
import { PaginationOutput, PaginationWithSearchBlogNameTerm } from 'src/base/models/pagination.base.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogPg } from '../domain/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(BlogPg)
    private readonly blogRepo: Repository<BlogPg>,
  ) { }

  async getById(id: string): Promise<BlogOutputModel | null> {
    const user = await this.blogRepo.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException();
    }
    return BlogOutputModelMapper(user);
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

    const blogQueryBuilder = this.blogRepo.createQueryBuilder("b");

    if (conditions.length > 0) {
      conditions.forEach((condition, i) => blogQueryBuilder.where(condition, params[i]));
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
