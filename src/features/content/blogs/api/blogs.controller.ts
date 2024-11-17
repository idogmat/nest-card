import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  NotFoundException,
  Param,
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
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { AuthGetGuard } from 'src/utils/guards/auth-get.guard';
import { PostOutputModel } from '../../posts/api/model/output/post.output.model';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { EnhancedParseUUIDPipe } from 'src/utils/pipes/uuid-check';

export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
  ['title', 'blogId', 'blogName', 'content', 'createdAt'];

export const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> =
  ['name', 'description', 'createdAt'];

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
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
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
  ) {

    const blog: BlogOutputModel =
      await this.blogsQueryRepository.getById(id);

    if (!blog) throw new NotFoundException();

    return blog;
  }

  @UseGuards(AuthGetGuard)
  @Get(':blogId/posts')
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
}
