import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationOutput, PaginationWithSearchBlogNameTerm } from 'src/base/models/pagination.base.model';
import { Post, PostModelType } from '../domain/post.entity';
import { PostOutputModel, PostOutputModelMapper } from '../api/model/output/post.output.model';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: PostModelType,
    @InjectDataSource() protected dataSource: DataSource
  ) { }

  async getById(id: string, userId?: string): Promise<PostOutputModel | null> {

    const res = await this.dataSource.query(`
      SELECT p.*, b.name as "blogName"
	    FROM public.post_pg as p
      LEFT JOIN public.blog_pg as b
      ON p."blogId" = b.id
      WHERE p.id = $1;
      `, [id]);

    if (!res[0]) {
      return null;
    }

    return PostOutputModelMapper(res[0], userId);
  }

  async getAll(
    pagination: PaginationWithSearchBlogNameTerm,
    blogId: string,
    userId?: string
  ): Promise<PaginationOutput<PostOutputModel>> {
    const conditions = [];
    const params = [];

    if (blogId) {
      conditions.push(`"blogId" = $${params.length + 1}`);
      params.push(`${blogId}`);
    }

    if (pagination.searchNameTerm) {
      conditions.push(`title ILIKE $${params.length + 1}`);
      params.push(`%${pagination.searchNameTerm}%`);
    }


    const totalCount = await this.dataSource.query(`
      SELECT COUNT(*)
      FROM public.post_pg as p
      LEFT JOIN public.blog_pg as b
      ON b.id = p."blogId"
      ${conditions.length > 0 ? 'WHERE ' + conditions.join(' OR ') : ''};
      `, conditions.length > 0 ? params : []);
    const posts = await this.dataSource.query(`
        SELECT p.*, b."name" as "blogName"
        FROM public.post_pg as p
        LEFT JOIN public.blog_pg as b
        ON b.id = p."blogId"
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
    const mappedPosts = posts.map(b => PostOutputModelMapper(b, userId));

    return new PaginationOutput<PostOutputModel>(
      mappedPosts,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount[0].count),
    );;
  }

  // private async __getResult(
  //   filter: FilterQuery<Post>,
  //   pagination: PaginationWithSearchBlogNameTerm,
  //   userId?: string
  // ): Promise<PaginationOutput<PostOutputModel>> {
  //   const posts = await this.postModel
  //     .find(filter)
  //     .sort({
  //       [pagination.sortBy]: pagination.getSortDirectionInNumericFormat(),
  //     })
  //     .skip(pagination.getSkipItemsCount())
  //     .limit(pagination.pageSize);

  //   const totalCount = await this.postModel.countDocuments(filter);

  //   const mappedPosts = posts.map(b => PostOutputModelMapper(b, userId));

  //   return new PaginationOutput<PostOutputModel>(
  //     mappedPosts,
  //     pagination.pageNumber,
  //     pagination.pageSize,
  //     totalCount,
  //   );
  // }
}
