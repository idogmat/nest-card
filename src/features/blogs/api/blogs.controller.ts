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
} from '../../../base/models/pagination.base.model';
import { SortingPropertiesType } from '../../../base/types/sorting-properties.type';
import { BlogOutputModel } from './model/output/blog.output.model';
import { BlogCreateModel } from './model/input/create-blog.input.model';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { PostsService } from 'src/features/posts/application/posts.service';
import { PostsQueryRepository } from 'src/features/posts/infrastructure/posts.query-repository';
import { PostOutputModel } from 'src/features/posts/api/model/output/post.output.model';
import { PostInBlogCreateModel } from './model/input/create-post.input.model';
import { BasicAuthGuard } from 'src/common/guards/basic-auth.guard';
import { AuthGetGuard } from 'src/common/guards/auth-get.guard';

export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
  ['title', 'blogId', 'blogName', 'content', 'createdAt'];

export const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> =
  ['name', 'description', 'createdAt'];

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsService: PostsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) { }

  @Get()
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

  @Get(':id')
  async getById(
    @Param('id') id: string,
  ) {

    const blog: BlogOutputModel =
      await this.blogsQueryRepository.getById(id);

    if (!blog) throw new NotFoundException();

    return blog;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
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
  @Post(':id/posts')
  async createPost(
    @Param('id') id: string,
    @Body() createModel: PostInBlogCreateModel
  ) {
    const { content, shortDescription, title } = createModel;

    const blog = await this.getById(id);

    const createdPostId = await this.postsService.create(
      id, blog.name, content, shortDescription, title,
    );

    const createdPost: PostOutputModel | null =
      await this.postsQueryRepository.getById(createdPostId);

    return createdPost;
  }

  @UseGuards(AuthGetGuard)
  @Get(':id/posts')
  async getPosts(
    @Param('id') id: string,
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

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async update(
    // @Request() req,
    @Param('id') id: string,
    @Body() updateModel: BlogCreateModel
  ) {
    const updatedResult = await this.blogsService.update(id, updateModel);

    if (!updatedResult) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async delete(
    // @Request() req,
    @Param('id') id: string
  ) {
    const deletingResult: boolean = await this.blogsService.delete(id);

    if (!deletingResult) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }
  }
}
