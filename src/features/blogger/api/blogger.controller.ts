import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { BlogCreateModel } from 'src/features/content/blogs/api/model/input/create-blog.input.model';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { BloggerService } from '../application/blogger.service';
import { BloggerQueryRepository } from '../infrastructure/blogger.query-repository';
import { Blog } from 'src/features/content/blogs/domain/blog.entity';
import { PaginationOutput, PaginationWithSearchBlogNameTerm, PaginationWithSearchLoginTerm } from 'src/base/models/pagination.base.model';
import { BlogOutputModel } from 'src/features/content/blogs/api/model/output/blog.output.model';
import { SortingPropertiesType } from 'src/base/types/sorting-properties.type';
import { EnhancedParseUUIDPipe } from 'src/utils/pipes/uuid-check';
import { PostInBlogCreateModel } from 'src/features/content/blogs/api/model/input/create-post.input.model';
import { PostOutputModel } from 'src/features/content/posts/api/model/output/post.output.model';
import { BanUserForBlogInputModel } from '../model/input/banBlogForUser.input.model';
import { BanndedUserOutputModel } from '../model/output/banned.users.output.model';

export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
  ['title', 'blogId', 'blogName', 'content', 'createdAt'];

export const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> =
  ['name', 'description', 'createdAt'];

export const BLOGS_BANNED_PROPERTIES: SortingPropertiesType<BanndedUserOutputModel> =
  ['login', 'createdAt'];

@ApiTags('Blogger')
@Controller('blogger')
export class BloggerController {
  constructor(
    private readonly bloggerService: BloggerService,
    private readonly bloggerQueryRepository: BloggerQueryRepository,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post('/blogs')
  async create(
    @Req() req: any,
    @Body() createModel: BlogCreateModel
  ) {
    const createdBlogId = await this.bloggerService.create(
      createModel as Blog, req.user
    );
    console.log(createdBlogId);
    const createdBlog: any | null =
      await this.bloggerQueryRepository.getBlogById(createdBlogId);

    return createdBlog;
  }
  @UseGuards(JwtAuthGuard)
  @Get('/blogs')
  async getAll(
    @Query() query: any,
    @Req() req: any,
  ) {
    const pagination: PaginationWithSearchBlogNameTerm =
      new PaginationWithSearchBlogNameTerm(
        query,
        BLOGS_SORTING_PROPERTIES,
      );

    const blogs: PaginationOutput<BlogOutputModel> =
      await this.bloggerQueryRepository.getAll(pagination, req.user.userId);

    return blogs;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/blogs/:blogId')
  @HttpCode(204)
  async deleteBlog(
    @Req() req: any,
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
  ) {
    await this.bloggerService.deleteBlog(blogId, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/blogs/:blogId')
  @HttpCode(204)
  async updateBlog(
    @Req() req: any,
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Body() updateModel: BlogCreateModel
  ) {
    await this.bloggerService.updateBlog(blogId, req.user?.userId, updateModel);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/blogs/:blogId/posts')
  async createPost(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Req() req: any,
    @Body() createModel: PostInBlogCreateModel
  ) {
    const createdPost =
      await this.bloggerService.createPost(blogId, req.user, createModel);

    return createdPost;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/blogs/:blogId/posts')
  async getPosts(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Query() query: any,
    @Req() req: any,
  ) {
    const blog = await this.bloggerService.getById(blogId);
    if (!blog) throw new NotFoundException();
    const pagination: PaginationWithSearchBlogNameTerm =
      new PaginationWithSearchBlogNameTerm(
        query,
        POSTS_SORTING_PROPERTIES,
      );

    const posts: PaginationOutput<PostOutputModel> =
      await this.bloggerQueryRepository.getAllPosts(pagination, blogId, req?.user?.userId);

    return posts;
  }

  @UseGuards(JwtAuthGuard)
  @Put('blogs/:blogId/posts/:postId')
  @HttpCode(204)
  async updatePost(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Param('postId', new EnhancedParseUUIDPipe()) postId: string,
    @Body() updateModel: PostInBlogCreateModel,
    @Req() req: any,
  ) {

    await this.bloggerService.updatePost(
      blogId,
      postId,
      req.user.userId,
      updateModel
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('blogs/:blogId/posts/:postId')
  @HttpCode(204)
  async deletePost(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Param('postId', new EnhancedParseUUIDPipe()) postId: string,
    @Req() req: any,
  ) {

    await this.bloggerService.deletePost(
      blogId,
      postId,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:userId/ban')
  @HttpCode(204)
  async bunBlogForUser(
    @Req() req: any,
    @Param('userId', new EnhancedParseUUIDPipe()) userId: string,
    @Body() banPayload: BanUserForBlogInputModel
  ) {
    await this.bloggerService.banUserForBlog(
      banPayload, req.user, userId
    );
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/blog/:blogId')
  async getBannedUsers(
    @Query() query: any,
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Req() req: any,
  ) {
    const pagination: PaginationWithSearchLoginTerm =
      new PaginationWithSearchLoginTerm(
        query,
        BLOGS_BANNED_PROPERTIES,
      );

    const blogs: PaginationOutput<BanndedUserOutputModel> =
      await this.bloggerQueryRepository.getBannedUsers(pagination, blogId, req.user.userId);

    return blogs;
  }
}
