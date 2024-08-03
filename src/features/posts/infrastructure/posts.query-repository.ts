import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationOutput, PaginationWithSearchBlogNameTerm } from 'src/base/models/pagination.base.model';
import { FilterQuery } from 'mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { PostOutputModel, PostOutputModelMapper } from '../api/model/output/post.output.model';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: PostModelType) {}
  
  async getById(id: string): Promise<PostOutputModel | null> {
    const blog = await this.postModel.findOne({ _id: id });

    if (blog === null) {
      return null;
    }

    return PostOutputModelMapper(blog);
  }

  async getAll(
    pagination: PaginationWithSearchBlogNameTerm,
  ): Promise<PaginationOutput<PostOutputModel>> {
    const filters: FilterQuery<Post>[] = [];

    if (pagination.searchNameTerm) {
      filters.push({
        email: { $regex: pagination.searchNameTerm, $options: 'i' },
      });
    }

    const filter: FilterQuery<Post> = {};

    if (filters.length > 0) {
      filter.$or = filters;
    }

    return await this.__getResult(filter, pagination);
  }

  private async __getResult(
    filter: FilterQuery<Post>,
    pagination: PaginationWithSearchBlogNameTerm,
  ): Promise<PaginationOutput<PostOutputModel>> {
    const blogs = await this.postModel
      .find(filter)
      .sort({
        [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
      })
      .skip(pagination.getSkipItemsCount())
      .limit(pagination.pageSize);

    const totalCount = await this.postModel.countDocuments(filter);

    const mappedPosts = blogs.map(PostOutputModelMapper);

    return new PaginationOutput<PostOutputModel>(
      mappedPosts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }
}
