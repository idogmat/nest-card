import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthUser } from "src/features/auth/auth.module";
import { BlogCreateModel } from "src/features/content/blogs/api/model/input/create-blog.input.model";
import { PostInBlogCreateModel } from "src/features/content/blogs/api/model/input/create-post.input.model";
import { Blog } from "src/features/content/blogs/domain/blog.entity";
import { PostOutputModelMapper } from "src/features/content/posts/api/model/output/post.output.model";
import { Post } from "src/features/content/posts/domain/post.entity";
import { PostLike } from "src/features/likes/domain/post-like-info.entity";
import { Repository } from "typeorm";
import { BanUserForBlogInputModel } from "../model/input/banBlogForUser.input.model";
import { BlogBlock } from "src/features/content/blogs/domain/blog.ban.entity";
import { UsersRepository } from "src/features/users/infrastructure/users.repository";

@Injectable()
export class BloggerService {
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepo: Repository<Blog>,
    @InjectRepository(BlogBlock)
    private readonly blogBlockRepo: Repository<BlogBlock>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    private readonly userRepo: UsersRepository,
  ) { }

  async getById(id: string): Promise<Blog | null> {
    const blog = await this.blogRepo.findOneBy({ id: id });
    console.log(blog);
    return blog;
  }

  async getPostById(id: string): Promise<Post | null> {
    const post = await this.postRepo.findOneBy({ id: id });
    console.log(post, 'post');
    if (!post) {
      return null;
    }
    return post;
  }

  async create(newBlog: Blog, user: AuthUser): Promise<string> {
    const blog = this.blogRepo.create({
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt || new Date().toISOString(),
      isMembership: newBlog.isMembership || false,
      userId: user.userId
    });
    const savedBlog = await this.blogRepo.save(blog);
    return savedBlog.id;
  }

  async updateBlog(id: string, userId: string, newModel: BlogCreateModel) {
    const blog = await this.blogRepo.findOneBy({ id: id });
    if (!blog?.id) throw new NotFoundException();
    if (blog?.userId !== userId) throw new ForbiddenException();
    await this.blogRepo.update({ id: id }, { ...newModel });
  }

  async updatePost(blogId: string, postId: string, userId: string, newModel: PostInBlogCreateModel) {
    const blog = await this.blogRepo.findOneBy({ id: blogId });
    if (!blog) throw new NotFoundException();
    if (blog.userId !== userId) throw new ForbiddenException();
    const post = await this.postRepo.findOneBy({ id: postId });
    if (!post?.id) throw new NotFoundException();
    await this.postRepo.update({ id: postId }, { ...newModel });
  }

  async deleteBlog(id: string, userId: string): Promise<boolean> {
    const blog = await this.blogRepo.findOneBy({ id: id });
    if (!blog?.id) throw new NotFoundException();
    if (blog?.userId !== userId) throw new ForbiddenException();
    const result = await this.blogRepo.delete({ id: id });
    return result.affected === 1;
  }

  async deletePost(blogId: string, postId: string, userId: string) {
    const blog = await this.blogRepo.findOneBy({ id: blogId });
    if (!blog) throw new NotFoundException();
    if (blog.userId !== userId) throw new ForbiddenException();
    const post = await this.postRepo.findOneBy({ id: postId });
    if (!post?.id) throw new NotFoundException();
    const result = await this.postRepo.delete({ id: postId });
    return result.affected === 1;
  }

  async createPost(id: string, user: AuthUser, model: PostInBlogCreateModel): Promise<any> {
    const blog = await this.blogRepo.findOneBy({ id: id });
    console.log(blog);
    if (!blog?.id) throw new NotFoundException();
    if (blog?.userId !== user?.userId) throw new ForbiddenException();
    const { content, shortDescription, title } = model;
    const postMap =
      "p.id, p.title, p.\"shortDescription\", p.content, p.blogId, p.\"createdAt\"";
    const created = this.postRepo.create({
      content,
      shortDescription,
      title,
      blogId: blog.id,
      createdAt: new Date()
    });
    const post = await this.postRepo.save(created);
    const result = await this.postRepo.createQueryBuilder("p")
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
          .where("pl.postId = p.id");
      }, "extendedLikesInfo")
      .where("p.id = :postId", { postId: post.id })
      .getRawOne();
    console.log(result);
    return PostOutputModelMapper(result as Post & { blogName: string; });
  }

  async banUserForBlog(banPayload: BanUserForBlogInputModel, user: AuthUser, bannedUserId: string) {
    const [
      blog,
      userForBan,
      blogBlocked
    ] = await Promise.all([
      this.blogRepo.findOneBy({ id: banPayload.blogId }),
      this.userRepo.getById(bannedUserId),
      this.blogBlockRepo.findOne({
        where: {
          blockedByUserId: bannedUserId,
          blogId: banPayload.blogId,
        },
      })
    ]).then(res => { console.log(res); return res; });
    if (!blog?.id) throw new NotFoundException();
    if (!userForBan?.id) throw new NotFoundException();
    if (
      blog?.userId !== user.userId ||
      user.userId === bannedUserId
    ) throw new ForbiddenException();

    if (blogBlocked && banPayload.isBanned) throw new NotFoundException();
    if (banPayload.isBanned) {
      await this.blogBlockRepo.insert({
        blogId: blog.id,
        blockedByUserId: bannedUserId,
        banReason: banPayload.banReason,
        createdAt: new Date()
      });
      return;
    } else if (blogBlocked) {
      await this.blogBlockRepo.delete(blogBlocked);
      return;
    }

  }
}