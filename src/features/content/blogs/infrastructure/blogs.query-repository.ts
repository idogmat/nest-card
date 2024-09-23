import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogOutputModel, BlogOutputModelMapper } from '../api/model/output/blog.output.model';
import { PaginationOutput, PaginationWithSearchBlogNameTerm } from 'src/base/models/pagination.base.model';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  async getById(id: string): Promise<BlogOutputModel | null> {
    const res = await this.dataSource.query(`
      SELECT *
	    FROM public.blog_pg
      WHERE id = $1;
      `, [id]);

    if (!res[0]) {
      throw new NotFoundException();
    }

    return BlogOutputModelMapper(res[0]);
  }

  async getAll(
    pagination: PaginationWithSearchBlogNameTerm,
  ): Promise<PaginationOutput<BlogOutputModel>> {
    const conditions = [];
    const params = [];
    if (pagination.searchNameTerm) {
      conditions.push(`name ILIKE $${params.length + 1}`);
      params.push(`%${pagination.searchNameTerm}%`);
    }

    const totalCount = await this.dataSource.query(`
      SELECT COUNT(*)
      FROM public.blog_pg
      ${conditions.length > 0 ? 'WHERE ' + conditions.join(' OR ') : ''};
      `, conditions.length > 0 ? params : []);

    const blogs = await this.dataSource.query(`
        SELECT *
        FROM public.blog_pg
        ${conditions.length > 0 ? 'WHERE ' + conditions.join(' OR ') : ''}
        ORDER BY "${pagination.sortBy}" ${pagination.sortDirection}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2};
        `,
      conditions.length > 0
        ? [...params, pagination.pageSize,
        (pagination.pageNumber - 1) * pagination.pageSize]
        : [pagination.pageSize,
        (pagination.pageNumber - 1) * pagination.pageSize]
    );

    const mappedBlogs = blogs.map(BlogOutputModelMapper);

    return new PaginationOutput<BlogOutputModel>(
      mappedBlogs,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount[0].count),
    );
  }

  // private async __getResult(
  //   filter: FilterQuery<Blog>,
  //   pagination: PaginationWithSearchBlogNameTerm,
  // ): Promise<PaginationOutput<BlogOutputModel>> {
  //   const blogs = await this.blogModel
  //     .find(filter)
  //     .sort({
  //       [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
  //     })
  //     .skip(pagination.getSkipItemsCount())
  //     .limit(pagination.pageSize);

  //   const totalCount = await this.blogModel.countDocuments(filter);

  //   const mappedPosts = blogs.map(BlogOutputModelMapper);

  //   return new PaginationOutput<BlogOutputModel>(
  //     mappedPosts,
  //     pagination.pageNumber,
  //     pagination.pageSize,
  //     totalCount,
  //   );
  // }
}
