import { Injectable } from '@nestjs/common';
import { PaginationOutput, PaginationWithSearchBlogNameTerm } from 'src/base/models/pagination.base.model';
import { PostOutputModel, PostOutputModelMapper } from '../api/model/output/post.output.model';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Post } from '../domain/post.entity';
import { PostLike } from './../../../../features/likes/domain/post-like-info.entity';
import { User } from 'src/features/users/domain/user.entity';

const postMap =
  "p.id, p.title, p.\"shortDescription\", p.content, p.blogId, p.\"createdAt\"";

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }

  async getById(postId: string, userId?: string): Promise<PostOutputModel | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const post = await queryRunner.manager.createQueryBuilder(Post, "p")
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
          .from(PostLike, "pl")
          .leftJoin(User, 'u', 'pl.userId IS NOT NULL AND u.id = pl.userId')
          .where("pl.postId = p.id")
          .andWhere("u.banned != true");
      }, "extendedLikesInfo")
      .where("p.id = :postId", { postId })
      .getRawOne();

    if (!post) {
      return null;
    }

    return PostOutputModelMapper(post, userId);
  }

  async getByBlogId(blogId: string, userId?: string): Promise<PostOutputModel | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const post = await queryRunner.manager.createQueryBuilder(Post, "p")
      .leftJoinAndSelect("p.blog", "b")
      .select([
        postMap,
        "b.name AS \"blogName\"",
      ])
      .addSelect((subQuery) => {
        return subQuery.select("COALESCE" +
          "(jsonb_agg(jsonb_build_object(" +
          "'userId', pl.userId, " +
          "'postId', pl.postId, " +
          "'type', pl.type, " +
          "'login', pl.login, " +
          "'addedAt', pl.addedAt" +
          ") ORDER BY pl.addedAt DESC ) " +
          "FILTER (WHERE pl.userId IS NOT NULL), '[]')")
          .from(PostLike, "pl")
          .leftJoin(User, 'u', 'pl.userId IS NOT NULL AND u.id = pl.userId')
          .where("pl.postId = p.id")
          .andWhere("u.banned != true");
      }, "extendedLikesInfo")
      .where("p.blogId = :blogId", { blogId })
      .getRawOne();

    console.log(post);
    if (!post) {
      return null;
    }

    return PostOutputModelMapper(post, userId);
  }

  // const postQueryBuilder = this.postRepo.find({
  //   relations: {
  //     blog: true,
  //     extendedLiksInfo: true
  //   },
  //   order: {
  //     [sortBy]: sortDirection,
  //     blog: {
  //       'name': 
  //     }
  //   }
  // });

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
        return subQuery.select("COALESCE" +
          "(jsonb_agg(jsonb_build_object(" +
          "'userId', pl.userId, " +
          "'postId', pl.postId, " +
          "'type', pl.type, " +
          "'login', pl.login, " +
          "'addedAt', pl.addedAt" +
          ") ORDER BY pl.addedAt DESC ) " +
          "FILTER (WHERE pl.userId IS NOT NULL), '[]')")
          .from(PostLike, "pl")
          .where("pl.postId = p.id");
      }, "extendedLikesInfo");


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


    console.log(posts);

    const mappedPosts = posts.map(b => PostOutputModelMapper(b, userId));
    return new PaginationOutput<PostOutputModel>(
      mappedPosts,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
  }
}
