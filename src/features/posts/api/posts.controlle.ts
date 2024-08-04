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
} from '@nestjs/common';
import {
  PaginationOutput,
  PaginationWithSearchBlogNameTerm,
} from '../../../base/models/pagination.base.model';
import { SortingPropertiesType } from '../../../base/types/sorting-properties.type';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostOutputModel } from './model/output/post.output.model';
import { PostCreateModel } from './model/input/create-post.input.model';
import { PostsService } from '../application/posts.service';
import { BlogsQueryRepository } from 'src/features/blogs/infrastructure/blogs.query-repository';
import { PostUpdateModel } from './model/input/update-post.input.model';

export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
  ['title', 'blogId', 'blogName', 'content', 'createdAt'];

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
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
        POSTS_SORTING_PROPERTIES,
      );

    const posts: PaginationOutput<PostOutputModel> =
      await this.postsQueryRepository.getAll(pagination);

    return posts;
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
  ) {
    const post: PostOutputModel =
      await this.postsQueryRepository.getById(id);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @Post()
  async create(@Body() createModel: PostCreateModel) {
    const blog = await this.blogsQueryRepository.getById(createModel?.blogId);
    if (!blog) throw new NotFoundException();
    const { blogId, content, shortDescription, title } = createModel;

    const createdPostId = await this.postsService.create(
      blogId, blog.name, content, shortDescription, title,
    );

    const createdPost: PostOutputModel | null =
      await this.postsQueryRepository.getById(createdPostId);

    return createdPost;
  }

  @Put(':id')
  @HttpCode(204)
  async update(@Param('id') id: string, @Body() updateModel: PostUpdateModel) {
    const post = await this.getById(id);
    if (!post) {
      throw new NotFoundException();
    }
    const updatedResult = await this.postsService.update(id, updateModel);

    if (!updatedResult) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    const post = await this.getById(id);
    if (!post) {
      throw new NotFoundException();
    }
    const deletingResult: boolean = await this.postsService.delete(id);

    if (!deletingResult) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
