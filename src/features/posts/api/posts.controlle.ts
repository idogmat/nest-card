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

export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
  ['title', 'blogId', 'blogName', 'content', 'createdAt'];

// Tag для swagger
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) { }

  @Get()
  async getAll(
    // Для работы с query
    @Query() query: any,
  ) {

    const pagination: PaginationWithSearchBlogNameTerm =
      new PaginationWithSearchBlogNameTerm(
        query,
        POSTS_SORTING_PROPERTIES,
      );

    const users: PaginationOutput<PostOutputModel> =
      await this.postsQueryRepository.getAll(pagination);

    return users;
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
  ) {
    const users: PostOutputModel =
      await this.postsQueryRepository.getById(id);

    return users;
  }

  @Post()
  async create(@Body() createModel: PostCreateModel) {
    const { blogId, content, shortDescription, title } = createModel;

    const createdUserId = await this.postsService.create(
      blogId, content, shortDescription, title
    );

    const createdUser: PostOutputModel | null =
      await this.postsQueryRepository.getById(createdUserId);

    return createdUser;
  }

  // :id в декораторе говорит nest о том что это параметр
  // Можно прочитать с помощью @Param("id") и передать в property такое же название параметра
  // Если property не указать, то вернется объект @Param()
  @Delete(':id')
  // Для переопределения default статус кода https://docs.nestjs.com/controllers#status-code
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    const deletingResult: boolean = await this.postsService.delete(id);

    if (!deletingResult) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
