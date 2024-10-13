import { Injectable } from '@nestjs/common';
import { PaginationOutput, PaginationWithSearchBlogNameTerm } from 'src/base/models/pagination.base.model';
import { PostOutputModel, PostOutputModelMapper } from '../api/model/output/post.output.model';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { PostPg } from '../domain/post.entity';

const postMap =
  "p.id, p.title, p.\"shortDescription\", p.content, p.blogId, p.\"createdAt\"";

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(PostPg)
    private readonly postRepo: Repository<PostPg>,
  ) { }

  async getById(postId: string, userId?: string): Promise<PostOutputModel | null> {
    const res = await this.dataSource.query(`
      SELECT p.*, b.name as "blogName",
      (SELECT jsonb_agg(json_build_object(
        'userId', pl."userId",
        'postId', pl."userId",
        'login', pl.login,
        'like', pl.type,
        'addedAt', pl."addedAt"
        ) ORDER BY pl."addedAt" DESC)) AS "extendedLikesInfo"
	    FROM public.post_pg as p
      LEFT JOIN public.blog_pg as b
      ON p."blogId" = b.id
      LEFT JOIN public.post_like_pg as pl
      ON p.id = pl."postId"
      WHERE p.id = $1
      GROUP BY p.id, b.name
      `, [postId]);

    if (!res[0]) {
      return null;
    }

    return PostOutputModelMapper(res[0], userId);
  }

  async getByBlogId(blogId: string, userId?: string): Promise<PostOutputModel | null> {
    const post = await this.postRepo.createQueryBuilder("p")
      .leftJoinAndSelect("p.blog", "b")
      .leftJoinAndSelect("p.likes", "pl")
      .select([
        postMap,
        "b.name AS \"blogName\"",
        "jsonb_agg(json_build_object(" +
        "'userId', pl.userId, " +
        "'postId', pl.postId, " +
        "'login', pl.login, " +
        "'like', pl.type, " +
        "'addedAt', pl.addedAt" +
        ")) AS extendedLikesInfo"
      ])
      .where("p.blogId = :blogId", { blogId })
      .groupBy("p.id")
      .addGroupBy("b.name")
      .getRawOne();

    console.log(post);
    if (!post) {
      return null;
    }

    return PostOutputModelMapper(post, userId);
  }

  async getAll(
    pagination: PaginationWithSearchBlogNameTerm,
    blogId?: string,
    userId?: string
  ): Promise<PaginationOutput<PostOutputModel>> {
    const conditions = [];
    const params = [];


    const postQueryBuilder = this.postRepo.createQueryBuilder("p")
      .leftJoinAndSelect("p.blog", "b")
      .leftJoinAndSelect("p.extendedLikesInfo", "pl")
      .select([
        "p.*",
        "b.name AS \"blogName\"",
        "jsonb_agg(json_build_object(" +
        "'userId', pl.userId, " +
        "'postId', pl.postId, " +
        "'login', pl.login, " +
        "'like', pl.type, " +
        "'addedAt', pl.addedAt" +
        ")) AS extendedLikesInfo"
      ])
      .groupBy("p.id")
      .addGroupBy("b.name");

    if (pagination.searchNameTerm) {
      conditions.push("p.title ilike :title");
      params.push({ title: `%${pagination.searchNameTerm}%` });
    }

    if (blogId) {
      conditions.push(`p."blogId" = :blogId`);
      params.push({ blogId });
    }

    if (conditions.length > 0) {
      conditions.forEach((condition, i) => {
        if (i === 0)
          postQueryBuilder.where(condition, params[i]);
        if (i === 1)
          postQueryBuilder.andWhere(condition, params[i]);
      });
    }
    console.log(pagination, 'pagination');
    let sortBy = `p.${pagination.sortBy}`;
    if (pagination.sortBy === "blogName") {
      sortBy = "b.name";
    }

    const totalCount = await postQueryBuilder.getCount();

    const posts = await postQueryBuilder
      .orderBy(`${sortBy}`, pagination.sortDirection)
      .limit(pagination.pageSize)
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .getRawMany();

    console.log(posts.length);
    const mappedPosts = posts.map(b => PostOutputModelMapper(b, userId));
    return new PaginationOutput<PostOutputModel>(
      mappedPosts,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
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
