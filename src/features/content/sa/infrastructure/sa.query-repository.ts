import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOutput, PaginationWithSearchBlogNameTerm } from 'src/base/models/pagination.base.model';
import { BlogOutputModel } from 'src/features/content/blogs/api/model/output/blog.output.model';
import { Blog } from 'src/features/content/blogs/domain/blog.entity';
import { Repository } from 'typeorm';
import { BlogOutputSAModel, BlogOutputSAModelMapper } from '../model/output/sa.blogs.output';

@Injectable()
export class SuperAdminQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepo: Repository<Blog>,
  ) { }

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

    const totalCount = await blogQueryBuilder.getCount();

    const blogs = await blogQueryBuilder
      .leftJoin(`b.user`, 'u', 'u.id IS NOT NULL')
      .addSelect(['u.id', 'u.login'])
      .orderBy(`b.${pagination.sortBy}`, pagination.sortDirection)
      .take(pagination.pageSize)
      .skip((pagination.pageNumber - 1) * pagination.pageSize)
      .getMany();
    const mappedBlogs = blogs.map(BlogOutputSAModelMapper);

    return new PaginationOutput<BlogOutputSAModel>(
      mappedBlogs,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
  }
}
