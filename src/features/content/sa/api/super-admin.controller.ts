import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
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
import {
  PaginationOutput,
  PaginationWithSearchBlogNameTerm,
} from '../../../../base/models/pagination.base.model';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { BasicAuthGuard } from '../../../../utils/guards/basic-auth.guard';
import { PostsService } from '../../posts/application/posts.service';
import { PostOutputModel } from '../../posts/api/model/output/post.output.model';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { EnhancedParseUUIDPipe } from '../../../../utils/pipes/uuid-check';
import { BlogOutputModel } from '../../blogs/api/model/output/blog.output.model';
import { BlogsService } from '../../blogs/application/blogs.service';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query-repository';
import { BlogCreateModel } from '../../blogs/api/model/input/create-blog.input.model';
import { PostInBlogCreateModel } from '../../blogs/api/model/input/create-post.input.model';
import { SuperAdminQueryRepository } from '../infrastructure/sa.query-repository';
import { SuperAdminService } from '../application/sa.service';
import { BanInputModel, BlogBanInputModel } from '../model/input/sa.ban.input';
import { BlogOutputSAModel } from '../model/output/sa.blogs.output';

export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
  ['title', 'blogId', 'blogName', 'content', 'createdAt'];

export const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> =
  ['name', 'description', 'createdAt'];

@ApiTags('SuperAdmin')
@Controller('sa')
export class SuperAdminController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly superAdminQueryRepository: SuperAdminQueryRepository,
    private readonly superAdminService: SuperAdminService,
  ) { }

  @UseGuards(BasicAuthGuard)
  @Put('/users/:id/ban')
  @HttpCode(204)
  async banUser(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @Body() ban: BanInputModel
  ) {
    await this.superAdminService.banUser(id, ban);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/blogs/:blogId/ban')
  @HttpCode(204)
  async banBlog(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Body() ban: BlogBanInputModel
  ) {
    return await this.superAdminService.banBlog(blogId, ban);
  }

  // SA
  @UseGuards(BasicAuthGuard)
  @Get('blogs')
  async getAllSa(
    @Query() query: any,
  ) {
    const pagination: PaginationWithSearchBlogNameTerm =
      new PaginationWithSearchBlogNameTerm(
        query,
        BLOGS_SORTING_PROPERTIES,
      );

    const blogs: PaginationOutput<BlogOutputSAModel> =
      await this.superAdminQueryRepository.getAll(pagination);

    return blogs;
  }

  // SA
  @UseGuards(BasicAuthGuard)
  @Put('blogs/:blogId/bind-with-user/:userId')
  @HttpCode(204)
  async bindBlogWithUser(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Param('userId', new EnhancedParseUUIDPipe()) userId: string,
  ) {
    await this.superAdminService.bindUserWithBlog(blogId, userId);
  }

  @UseGuards(BasicAuthGuard)
  @Post('blogs')
  async create(@Body() createModel: BlogCreateModel) {
    const { name, description, websiteUrl } = createModel;

    const createdBlogId = await this.blogsService.create(
      name, description, websiteUrl
    );

    const createdBlog: BlogOutputModel | null =
      await this.blogsQueryRepository.getById(createdBlogId);

    return createdBlog;
  }

  @UseGuards(BasicAuthGuard)
  @Post('blogs/:blogId/posts')
  async createPost(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Body() createModel: PostInBlogCreateModel
  ) {
    const { content, shortDescription, title } = createModel;

    const blog: BlogOutputModel =
      await this.blogsQueryRepository.getById(blogId);

    if (!blog) throw new NotFoundException();
    const createdPostId = await this.postsService.create(
      blogId, content, shortDescription, title,
    );

    if (!createdPostId) throw new NotFoundException();
    const createdPost: PostOutputModel | null =
      await this.postsQueryRepository.getByIdForAdmin(createdPostId);

    return createdPost;
  }

  @UseGuards(BasicAuthGuard)
  @Get('blogs/:blogId/posts/:postId')
  async getByIdSa(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Param('postId', new EnhancedParseUUIDPipe()) postId: string,
  ) {
    const blog = await this.blogsQueryRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    const post: PostOutputModel =
      await this.postsQueryRepository.getByIdForAdmin(postId);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  // SA
  @UseGuards(BasicAuthGuard)
  @Put('blogs/:blogId/posts/:postId')
  @HttpCode(204)
  async updateSa(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Param('postId', new EnhancedParseUUIDPipe()) postId: string,
    @Body() updateModel: PostInBlogCreateModel
  ) {
    const blog = await this.blogsQueryRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    const post = await this.postsService.getById(postId);
    if (!post) throw new NotFoundException();
    const updatedResult = await this.postsService.update(postId, updateModel);

    if (!updatedResult) {
      throw new NotFoundException(`User with id ${postId} not found`);
    }
  }
  // SA
  @UseGuards(BasicAuthGuard)
  @Delete('blogs/:blogId/posts/:postId')
  @HttpCode(204)
  async deleteSa(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Param('postId', new EnhancedParseUUIDPipe()) postId: string,
  ) {
    const blog = await this.blogsQueryRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    const post = await this.postsService.getById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    const deletingResult: boolean = await this.postsService.delete(postId);

    if (!deletingResult) {
      throw new NotFoundException(`User with id ${postId} not found`);
    }
  }

  // SA
  @UseGuards(BasicAuthGuard)
  @Get('blogs/:blogId/posts')
  async getPostsSa(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Query() query: any,
    @Req() req?
  ) {
    const blog = await this.blogsQueryRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    const pagination: PaginationWithSearchBlogNameTerm =
      new PaginationWithSearchBlogNameTerm(
        query,
        POSTS_SORTING_PROPERTIES,
      );

    const posts: PaginationOutput<PostOutputModel> =
      await this.postsQueryRepository.getAllForAdmin(pagination, blogId, req?.user?.userId);

    return posts;
  }

  // SA
  @UseGuards(BasicAuthGuard)
  @Put('blogs/:id')
  @HttpCode(204)
  async update(
    // @Request() req,
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @Body() updateModel: BlogCreateModel
  ) {
    const updatedResult = await this.blogsService.update(id, updateModel);

    if (!updatedResult) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
  }

  // SA
  @UseGuards(BasicAuthGuard)
  @Delete('blogs/:blogId')
  @HttpCode(204)
  async delete(
    // @Request() req,
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string
  ) {
    const deletingResult: boolean = await this.blogsService.delete(blogId);

    if (!deletingResult) {
      throw new NotFoundException(`Blog with id ${blogId} not found`);
    }
  }
}
