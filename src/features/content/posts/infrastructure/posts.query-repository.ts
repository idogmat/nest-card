import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationOutput, PaginationWithSearchBlogNameTerm } from 'src/base/models/pagination.base.model';
import { FilterQuery, isValidObjectId } from 'mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { PostOutputModel, PostOutputModelMapper } from '../api/model/output/post.output.model';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: PostModelType) { }

  async getById(id: string, userId?: string): Promise<PostOutputModel | null> {

    if (!isValidObjectId(id)) return null;
    const model = await this.postModel.findById(id);
    if (model === null) {
      return null;
    }

    return PostOutputModelMapper(model, userId);
  }

  async getAll(
    pagination: PaginationWithSearchBlogNameTerm, id: string, userId: string
  ): Promise<PaginationOutput<PostOutputModel>> {
    const filters: FilterQuery<Post>[] = [];

    if (pagination.searchNameTerm) {
      filters.push({
        title: { $regex: pagination.searchNameTerm, $options: 'i' },
      });
    }

    let filter: FilterQuery<Post> = {};

    if (id) filter = { blogId: id };

    if (filters.length > 0) {
      filter.$or = filters;
    }

    return await this.__getResult(filter, pagination, userId);
  }

  private async __getResult(
    filter: FilterQuery<Post>,
    pagination: PaginationWithSearchBlogNameTerm,
    userId?: string
  ): Promise<PaginationOutput<PostOutputModel>> {
    const posts = await this.postModel
      .find(filter)
      .sort({
        [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
      })
      .skip(pagination.getSkipItemsCount())
      .limit(pagination.pageSize);

    const totalCount = await this.postModel.countDocuments(filter);

    const mappedPosts = posts.map(b => PostOutputModelMapper(b, userId));

    return new PaginationOutput<PostOutputModel>(
      mappedPosts,
      pagination.pageNumber,
      pagination.pageSize,
      totalCount,
    );
  }
}
