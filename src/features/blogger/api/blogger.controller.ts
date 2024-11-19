import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { BlogCreateModel } from 'src/features/content/blogs/api/model/input/create-blog.input.model';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { BloggerService } from '../application/blogger.service';
import { BloggerQueryRepository } from '../infrastructure/blogger.query-repository';
import { Blog } from 'src/features/content/blogs/domain/blog.entity';
import { PaginationOutput, PaginationWithSearchBlogNameTerm } from 'src/base/models/pagination.base.model';
import { BlogOutputModel } from 'src/features/content/blogs/api/model/output/blog.output.model';
import { SortingPropertiesType } from 'src/base/types/sorting-properties.type';

// export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
//   ['title', 'blogId', 'blogName', 'content', 'createdAt'];

export const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> =
  ['name', 'description', 'createdAt'];

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

    const createdBlog: any | null =
      await this.bloggerService.getById(createdBlogId);

    return createdBlog;
  }
  @UseGuards(JwtAuthGuard)
  @Get('blogs')
  async getAllSa(
    @Query() query: any,
  ) {
    const pagination: PaginationWithSearchBlogNameTerm =
      new PaginationWithSearchBlogNameTerm(
        query,
        BLOGS_SORTING_PROPERTIES,
      );

    const blogs: PaginationOutput<BlogOutputModel> =
      await this.bloggerQueryRepository.getAll(pagination);

    return blogs;
  }
}
