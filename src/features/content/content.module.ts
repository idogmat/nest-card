import { Module } from "@nestjs/common";
import { BlogsController } from "./blogs/api/blogs.controller";
import { PostsController } from "./posts/api/posts.controlle";
import { CommentsController } from "./comments/api/comments.controller";
import { BlogsService } from "./blogs/application/blogs.service";
import { PostsService } from "./posts/application/posts.service";
import { CommentsService } from "./comments/application/comments.service";
import { BlogsRepository } from "./blogs/infrastructure/blogs.repository";
import { BlogsQueryRepository } from "./blogs/infrastructure/blogs.query-repository";
import { PostsRepository } from "./posts/infrastructure/posts.repository";
import { PostsQueryRepository } from "./posts/infrastructure/posts.query-repository";
import { CommentsRepository } from "./comments/infrastructure/comments.repository";
import { CommentsQueryRepository } from "./comments/infrastructure/comments.query-repository";
import { CustomBlogIdValidation } from "./posts/validate/blogId.validate";
import { AuthModule } from "../auth/auth.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SuperAdminController } from "./sa/api/super-admin.controller";
import { Blog } from "./blogs/domain/blog.entity";
import { Post } from "./posts/domain/post.entity";
import { PostLike } from "../likes/domain/post-like-info.entity";
import { Comment } from "./comments/domain/comment.entity";
import { CommentLike } from "../likes/domain/comment-like-info.entity";
import { BloggerController } from "../blogger/api/blogger.controller";
import { BloggerService } from "../blogger/application/blogger.service";
import { BloggerQueryRepository } from "../blogger/infrastructure/blogger.query-repository";
import { BloggerRepository } from "../blogger/infrastructure/blogger.repository";
import { SuperAdminQueryRepository } from "./sa/infrastructure/sa.query-repository";
import { SuperAdminService } from "./sa/application/sa.service";
import { SuperAdminRepository } from "./sa/infrastructure/sa.repository";
import { TransactionManager } from "src/utils/transaction/transactionManager";
import { BlogBlock } from "./blogs/domain/blog.ban.entity";
import { BlogImage } from "./images/domain/blog-image.entity";
import { ImageService } from "./images/application/image.service";
import { S3StorageAdapter } from "./images/adapter/adapter.s3";
import { CqrsModule } from "@nestjs/cqrs";
import { InsertBlogImageUseCase } from "../blogger/application/use-cases/insert-image";
import { PostImage } from "./images/domain/post-image.entity";

@Module({
  imports: [
    AuthModule,
    CqrsModule,
    TypeOrmModule.forFeature([Blog, BlogBlock, Post, PostLike, Comment, CommentLike, BlogImage, PostImage])
  ],
  controllers: [
    BlogsController,
    PostsController,
    CommentsController,
    SuperAdminController,
    BloggerController,
  ],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    CustomBlogIdValidation,
    BloggerService,
    BloggerRepository,
    BloggerQueryRepository,
    SuperAdminQueryRepository,
    SuperAdminRepository,
    SuperAdminService,
    ImageService,
    TransactionManager,
    S3StorageAdapter,
    InsertBlogImageUseCase
  ],
  exports: []
})
export class ContentModule { }