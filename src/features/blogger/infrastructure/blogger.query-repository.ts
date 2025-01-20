import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { PaginationOutput, PaginationWithSearchBlogNameTerm, PaginationWithSearchLoginTerm } from 'src/base/models/pagination.base.model';
import { BlogOutputModel, BlogOutputModelMapper } from 'src/features/content/blogs/api/model/output/blog.output.model';
import { Blog } from 'src/features/content/blogs/domain/blog.entity';
import { PostOutputModel, PostOutputModelMapper } from 'src/features/content/posts/api/model/output/post.output.model';
import { Post } from 'src/features/content/posts/domain/post.entity';
import { PostLike } from 'src/features/likes/domain/post-like-info.entity';
import { User } from 'src/features/users/domain/user.entity';
import { DataSource, Repository } from 'typeorm';
import { BanndedUserOutputModel, BanndedUserOutputModelMapper } from '../model/output/banned.users.output.model';
import { BlogBlock } from 'src/features/content/blogs/domain/blog.ban.entity';
import { Comment } from 'src/features/content/comments/domain/comment.entity';
import { CommentLike } from 'src/features/likes/domain/comment-like-info.entity';
import { CommentByUserOutputModel, CommentByUserOutputModelMapper } from '../model/output/comment.output.model';
import { PostImage } from 'src/features/content/images/domain/post-image.entity';

@Injectable()
export class BloggerQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepo: Repository<Blog>,
    @InjectRepository(BlogBlock)
    private readonly blogBlockRepo: Repository<BlogBlock>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }
  async getBlogById(id: string): Promise<BlogOutputModel> {
    const blog = await this.blogRepo.createQueryBuilder("b")
      .leftJoinAndSelect(`b.images`, `i`)
      .where(`b.id = :id`, { id })
      .getOne()
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

    const blogQueryBuilder = this.blogRepo.createQueryBuilder("b")
      .leftJoinAndSelect(`b.images`, `i`)
      .where(`b."bannedByAdmin" != :banned`, { banned: true })
      .andWhere(`b."userId" = :userId`, { userId })
      .andWhere(qb => {
        const subQuery = qb.subQuery()
          .select("bb.blogId")
          .from(BlogBlock, "bb")
          .where("bb.blockedByUserId = :userId", { userId })
          .getQuery();
        return "b.id NOT IN " + subQuery;
      });

    if (conditions.length > 0) {
      conditions.forEach((condition, i) => blogQueryBuilder.andWhere(condition, params[i]));
    }

    const totalCount = await blogQueryBuilder.getCount();

    const blogs = await blogQueryBuilder
      .orderBy(`b.${pagination.sortBy}`, pagination.sortDirection)
      .take(pagination.pageSize)
      .skip((pagination.pageNumber - 1) * pagination.pageSize)
      .getMany();
    // console.log(blogs, 'blogs');
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
        "b.bannedByAdmin AS \"bannedByAdmin\"",
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
      .addSelect((subQuery) => {
        return subQuery.select("jsonb_agg(jsonb_build_object(" +
          "'url', pi.url, " +
          "'fileSize', pi.fileSize, " +
          "'height', pi.height, " +
          "'width', pi.width " +
          "))")
          .from(PostImage, "pi")
          .where("p.id = pi.postId")
      }, "images")
      .where(`b."bannedByAdmin" != true`);



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
          postQueryBuilder.andWhere(condition, params[i]);
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

  async getBannedUsers(
    pagination: PaginationWithSearchLoginTerm,
    blogId?: string,
    userId?: string
  ): Promise<PaginationOutput<BanndedUserOutputModel>> {
    const queryRunner = this.dataSource.createQueryRunner();
    const startTime = performance.now();

    const blog = await this.blogRepo.findOne({ where: { id: blogId } });
    const blocked = await this.blogBlockRepo.findOne({ where: { blockedByUserId: userId, id: blogId } });
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    console.log(`Execution Time: ${executionTime} milliseconds`);
    console.log(blog, blocked);
    if (!blog) throw new NotFoundException();
    if (blocked) throw new ForbiddenException();
    if (blog.userId !== userId) throw new ForbiddenException();

    const blogQueryBuilder = queryRunner.manager.createQueryBuilder(BlogBlock, "bb")
      .leftJoinAndSelect('bb.blog', "b")
      .leftJoinAndSelect('bb.blockedByUser', "uu")
      .select([
        "bb.*",
        "uu.login as login"
      ])
      .where(`b.id = :blogId`, { blogId })
      .andWhere(`uu.id IS NOT NULL`);

    let sortBy = `b.${pagination.sortBy}`;
    if (pagination.sortBy === 'login') {
      sortBy = `uu.login`;
    }

    if (pagination.searchLoginTerm) {
      blogQueryBuilder.andWhere(
        `(login ilike :term OR u."banReason" ilike :term)`,
        { term: `%${pagination.searchLoginTerm}%` }
      );
    }

    const totalCount = await blogQueryBuilder.getCount();
    console.log(totalCount);
    const users = await blogQueryBuilder
      .orderBy(sortBy, pagination.sortDirection)
      .limit(pagination.pageSize)
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .getRawMany();
    // console.log(users, 'users');
    const bannedUsers = users.map(b => BanndedUserOutputModelMapper(b));
    console.log('bannedUsers');
    return new PaginationOutput<BanndedUserOutputModel>(
      bannedUsers,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
  }

  async getAllComments(
    pagination: PaginationWithSearchBlogNameTerm,
    userId: string
  ): Promise<PaginationOutput<CommentByUserOutputModel>> {
    const queryRunner = this.dataSource.createQueryRunner();
    const postQueryBuilder = queryRunner.manager.createQueryBuilder(Comment, "c")
      .select([
        `p.id as "postId"`,
        `p.title as "postTitle"`,
        `p.blogId as "blogId"`,
        `b.name as "blogName"`,
        "c.*",
      ])
      .leftJoin("c.post", "p")
      .leftJoin(`p.blog`, "b")
      .where(`b."userId" =:userId`, { userId })
      .addSelect((subQuery) => {
        return subQuery.select("COALESCE(" +
          "jsonb_agg(jsonb_build_object(" +
          "'userId', cl.userId, " +
          "'commentId', cl.commentId, " +
          "'type', cl.type, " +
          "'login', cl.login, " +
          "'addedAt', cl.addedAt" +
          ")) FILTER (WHERE cl.userId IS NOT NULL), '[]')")
          .from(CommentLike, "cl")
          .leftJoin(User, 'u', 'cl.userId IS NOT NULL AND u.id = cl.userId')
          .where("cl.commentId = c.id")
          .andWhere("u.banned != :banned", { banned: true });
      }, "extendedLikesInfo");

    const totalCount = await postQueryBuilder.getCount();

    const comments = await postQueryBuilder
      .orderBy(`"${pagination.sortBy}"`, pagination.sortDirection)
      .limit(pagination.pageSize)
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .getRawMany();
    console.log(comments);
    const mappedComments = comments.map(b => CommentByUserOutputModelMapper(b, userId));
    return new PaginationOutput<CommentByUserOutputModel>(
      mappedComments,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
  }
}
