import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOutput, PaginationWithSearchBlogNameTerm } from 'src/base/models/pagination.base.model';
import { BlogOutputModel, BlogOutputModelMapper } from 'src/features/content/blogs/api/model/output/blog.output.model';
import { Blog } from 'src/features/content/blogs/domain/blog.entity';
import { PostOutputModel, PostOutputModelMapper } from 'src/features/content/posts/api/model/output/post.output.model';
import { Post } from 'src/features/content/posts/domain/post.entity';
import { PostLike } from 'src/features/likes/domain/post-like-info.entity';
import { User } from 'src/features/users/domain/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BloggerQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepo: Repository<Blog>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) { }
  async getBlogById(id: string) {
    const blog = await this.blogRepo.findOneBy({ id });
    return BlogOutputModelMapper(blog);
  }
  async getAll(
    pagination: PaginationWithSearchBlogNameTerm,
    userId: string,
  ): Promise<PaginationOutput<BlogOutputModel>> {
    const conditions = [];
    const params = [];
    if (pagination.searchNameTerm) {
      conditions.push("b.name ilike :name");
      params.push({ name: `%${pagination.searchNameTerm}%` });
    }

    const blogQueryBuilder = this.blogRepo.createQueryBuilder("b");

    if (conditions.length > 0) {
      conditions.forEach((condition, i) => blogQueryBuilder.andWhere(condition, params[i]));
    }

    const totalCount = await blogQueryBuilder.getCount();

    const blogs = await blogQueryBuilder
      .orderBy(`b.${pagination.sortBy}`, pagination.sortDirection)
      .take(pagination.pageSize)
      .skip((pagination.pageNumber - 1) * pagination.pageSize)
      .getMany();
    console.log(blogs, 'blogs');
    const mappedBlogs = blogs.map(BlogOutputModelMapper);

    return new PaginationOutput<BlogOutputModel>(
      mappedBlogs,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
  }

  async getAllPosts(
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
          .leftJoin(User, 'u', 'pl.userId IS NOT NULL AND u.id = pl.userId')
          .where("pl.postId = p.id")
          .andWhere("u.banned != true");
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

    const mappedPosts = posts.map(b => PostOutputModelMapper(b, userId));
    return new PaginationOutput<PostOutputModel>(
      mappedPosts,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
  }
}
