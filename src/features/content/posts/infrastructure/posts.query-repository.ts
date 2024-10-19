import { Injectable } from '@nestjs/common';
import { PaginationOutput, PaginationWithSearchBlogNameTerm } from 'src/base/models/pagination.base.model';
import { PostOutputModel, PostOutputModelMapper } from '../api/model/output/post.output.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostPg } from '../domain/post.entity';
import { PostLikePg } from 'src/features/likes/domain/post-like-info.entity';

const postMap =
  "p.id, p.title, p.\"shortDescription\", p.content, p.blogId, p.\"createdAt\"";

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(PostPg)
    private readonly postRepo: Repository<PostPg>,
  ) { }

  async getById(postId: string, userId?: string): Promise<PostOutputModel | null> {
    const post = await this.postRepo.createQueryBuilder("p")
      .leftJoinAndSelect("p.blog", "b")
      .select([
        postMap,
        "b.name AS \"blogName\"",
      ])
      .addSelect((subQuery) => {
        return subQuery.select("jsonb_agg(jsonb_build_object(" +
          "'userId', pl.userId, " +
          "'postId', pl.postId, " +
          "'type', pl.type, " +
          "'login', pl.login, " +
          "'addedAt', pl.addedAt" +
          ") ORDER BY pl.addedAt DESC )")
          .from(PostLikePg, "pl")
          .where("pl.postId = p.id");
      }, "extendedLikesInfo")
      .where("p.id = :postId", { postId })
      .groupBy("p.id")
      .addGroupBy("b.name")
      .getRawOne();

    if (!post) {
      return null;
    }

    return PostOutputModelMapper(post, userId);
  }

  async getByBlogId(blogId: string, userId?: string): Promise<PostOutputModel | null> {
    const post = await this.postRepo.createQueryBuilder("p")
      .leftJoinAndSelect("p.blog", "b")
      .select([
        postMap,
        "b.name AS \"blogName\"",
      ])
      .addSelect((subQuery) => {
        return subQuery.select("jsonb_agg(jsonb_build_object(" +
          "'userId', pl.userId, " +
          "'postId', pl.postId, " +
          "'type', pl.type, " +
          "'login', pl.login, " +
          "'addedAt', pl.addedAt" +
          ") ORDER BY pl.addedAt DESC )")
          .from(PostLikePg, "pl")
          .where("pl.postId = p.id");
      }, "extendedLikesInfo")
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
      .select([
        "p.*",
        "b.name AS \"blogName\"",
      ])
      .addSelect((subQuery) => {
        return subQuery.select("jsonb_agg(jsonb_build_object(" +
          "'userId', pl.userId, " +
          "'postId', pl.postId, " +
          "'type', pl.type, " +
          "'login', pl.login, " +
          "'addedAt', pl.addedAt" +
          ") ORDER BY pl.addedAt DESC )")
          .from(PostLikePg, "pl")
          .where("pl.postId = p.id");
      }, "extendedLikesInfo")
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


    // console.log(posts);

    const mappedPosts = posts.map(b => PostOutputModelMapper(b, userId));
    return new PaginationOutput<PostOutputModel>(
      mappedPosts,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
  }
}
