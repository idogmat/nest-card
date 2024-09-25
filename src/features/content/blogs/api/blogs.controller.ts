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
import { BlogOutputModel } from './model/output/blog.output.model';
import { BlogCreateModel } from './model/input/create-blog.input.model';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { PostInBlogCreateModel } from './model/input/create-post.input.model';
import { BasicAuthGuard } from 'src/common/guards/basic-auth.guard';
import { AuthGetGuard } from 'src/common/guards/auth-get.guard';
import { PostsService } from '../../posts/application/posts.service';
import { PostOutputModel } from '../../posts/api/model/output/post.output.model';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { EnhancedParseUUIDPipe } from 'src/common/pipes/uuid-check';

export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
  ['title', 'blogId', 'blogName', 'content', 'createdAt'];

export const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> =
  ['name', 'description', 'createdAt'];

@ApiTags('Blogs')
@Controller()
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) { }

  @Get('blogs')
  async getAll(
    @Query() query: any,
  ) {
    const pagination: PaginationWithSearchBlogNameTerm =
      new PaginationWithSearchBlogNameTerm(
        query,
        BLOGS_SORTING_PROPERTIES,
      );

    const blogs: PaginationOutput<BlogOutputModel> =
      await this.blogsQueryRepository.getAll(pagination);

    return blogs;
  }

  // SA
  @UseGuards(BasicAuthGuard)
  @Get('sa/blogs')
  async getAllSa(
    @Query() query: any,
  ) {
    const pagination: PaginationWithSearchBlogNameTerm =
      new PaginationWithSearchBlogNameTerm(
        query,
        BLOGS_SORTING_PROPERTIES,
      );

    const blogs: PaginationOutput<BlogOutputModel> =
      await this.blogsQueryRepository.getAll(pagination);

    return blogs;
  }

  @Get('blogs/:id')
  async getById(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
  ) {

    const blog: BlogOutputModel =
      await this.blogsQueryRepository.getById(id);

    if (!blog) throw new NotFoundException();

    return blog;
  }

  @UseGuards(BasicAuthGuard)
  @Post('sa/blogs')
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
  @Post('sa/blogs/:id/posts')
  async createPost(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @Body() createModel: PostInBlogCreateModel
  ) {
    const { content, shortDescription, title } = createModel;

    const blog: BlogOutputModel =
      await this.blogsQueryRepository.getById(id);

    if (!blog) throw new NotFoundException();
    const createdPostId = await this.postsService.create(
      id, content, shortDescription, title,
    );

    if (!createdPostId) throw new NotFoundException();
    const createdPost: PostOutputModel | null =
      await this.postsQueryRepository.getById(createdPostId);

    return createdPost;
  }

  @UseGuards(AuthGetGuard)
  @Get('blogs/:blogId/posts')
  async getPosts(
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
      await this.postsQueryRepository.getAll(pagination, blogId, req?.user?.userId);

    return posts;
  }

  // SA
  @UseGuards(BasicAuthGuard)
  @Get('sa/blogs/:id/posts')
  async getPostsSa(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @Query() query: any,
    @Req() req?
  ) {
    const blog = await this.blogsQueryRepository.getById(id);
    if (!blog) throw new NotFoundException();
    const pagination: PaginationWithSearchBlogNameTerm =
      new PaginationWithSearchBlogNameTerm(
        query,
        POSTS_SORTING_PROPERTIES,
      );

    const posts: PaginationOutput<PostOutputModel> =
      await this.postsQueryRepository.getAll(pagination, id, req?.user?.userId);

    return posts;
  }

  // SA
  @UseGuards(BasicAuthGuard)
  @Put('sa/blogs/:id')
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
  @Delete('sa/blogs/:id')
  @HttpCode(204)
  async delete(
    // @Request() req,
    @Param('id', new EnhancedParseUUIDPipe()) id: string
  ) {
    const deletingResult: boolean = await this.blogsService.delete(id);

    if (!deletingResult) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
  }
}
