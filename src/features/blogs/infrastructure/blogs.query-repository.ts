import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { BlogOutputModel, BlogOutputModelMapper } from '../api/model/output/blog.output.model';
import { PaginationOutput, PaginationWithSearchBlogNameTerm } from 'src/base/models/pagination.base.model';
import { FilterQuery } from 'mongoose';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}
  
  async getById(id: string): Promise<BlogOutputModel | null> {
    const blog = await this.blogModel.findOne({ _id: id });

    if (blog === null) {
      return null;
    }

    return BlogOutputModelMapper(blog);
  }

  async getAll(
    pagination: PaginationWithSearchBlogNameTerm,
  ): Promise<PaginationOutput<BlogOutputModel>> {
    const filters: FilterQuery<Blog>[] = [];

    if (pagination.searchNameTerm) {
      filters.push({
        email: { $regex: pagination.searchNameTerm, $options: 'i' },
      });
    }

    const filter: FilterQuery<Blog> = {};

    if (filters.length > 0) {
      filter.$or = filters;
    }

    return await this.__getResult(filter, pagination);
  }

  private async __getResult(
    filter: FilterQuery<Blog>,
    pagination: PaginationWithSearchBlogNameTerm,
  ): Promise<PaginationOutput<BlogOutputModel>> {
    const blogs = await this.blogModel
      .find(filter)
      .sort({
        [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
      })
      .skip(pagination.getSkipItemsCount())
      .limit(pagination.pageSize);

    const totalCount = await this.blogModel.countDocuments(filter);

    const mappedPosts = blogs.map(BlogOutputModelMapper);

    return new PaginationOutput<BlogOutputModel>(
      mappedPosts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }
}
