import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
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
import { AuthGetGuard } from '../../../../utils/guards/auth-get.guard';
import { PostOutputModel } from '../../posts/api/model/output/post.output.model';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';
import { EnhancedParseUUIDPipe } from '../../../../utils/pipes/uuid-check';
import { IntegrationService } from '../../integrations/applications/integration.service';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { BlogsRepository } from '../infrastructure/blogs.repository';

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
    private readonly integrationService: IntegrationService,
    private readonly blogsRepository: BlogsRepository,
  ) { }

  @UseGuards(AuthGetGuard)
  @Get()
  async getAll(
    @Query() query: any,
    @Req() req?
  ) {
    const pagination: PaginationWithSearchBlogNameTerm =
      new PaginationWithSearchBlogNameTerm(
        query,
        BLOGS_SORTING_PROPERTIES,
      );

    const blogs: PaginationOutput<BlogOutputModel> =
      await this.blogsQueryRepository.getAll(pagination, req?.user?.userId);

    return blogs;
  }
  @UseGuards(AuthGetGuard)
  @Get(':id')
  async getById(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @Req() req?
  ) {
    console.log(req?.user)
    const blog: BlogOutputModel =
      await this.blogsQueryRepository.getById(id, req?.user?.userId);

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

  @UseGuards(JwtAuthGuard)
  @Post(':blogId/subscription')
  async subscribe(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Req() req,
  ) {
    const blog = await this.blogsRepository.getById(blogId);
    if (!blog) throw new NotFoundException()
    try {
      await this.integrationService.create(blog.id, req.user.userId)
    } catch {
      throw new NotFoundException()
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':blogId/subscription')
  async unsubscribe(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Req() req,
  ) {
    const blog = await this.blogsRepository.getById(blogId);
    if (!blog) throw new NotFoundException()
    try {
      await this.integrationService.delete(blog.id, req.user.userId)
      await this.blogsRepository.save(blog)
    } catch {
      throw new NotFoundException()
    }
  }
}
