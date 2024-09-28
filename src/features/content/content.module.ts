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

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature()
  ],
  controllers: [
    BlogsController,
    PostsController,
    CommentsController
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
    CustomBlogIdValidation
  ],
  exports: []
})
export class ContentModule { }