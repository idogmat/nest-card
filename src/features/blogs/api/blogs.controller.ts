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
import { BlogOutputModel } from './model/output/blog.output.model';
import { BlogCreateModel } from './model/input/create-blog.input.model';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';

export const BLOGS_SORTING_PROPERTIES: SortingPropertiesType<BlogOutputModel> =
  ['name', 'description', 'createdAt'];

// Tag для swagger
@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) { }

  @Get()
  async getAll(
    // Для работы с query
    @Query() query: any,
  ) {

    const pagination: PaginationWithSearchBlogNameTerm =
      new PaginationWithSearchBlogNameTerm(
        query,
        BLOGS_SORTING_PROPERTIES,
      );

    const users: PaginationOutput<BlogOutputModel> =
      await this.blogsQueryRepository.getAll(pagination);

    return users;
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
  ) {
    const users: BlogOutputModel =
      await this.blogsQueryRepository.getById(id);

    return users;
  }

  @Post()
  async create(@Body() createModel: BlogCreateModel) {
    const { name, description, websiteUrl } = createModel;

    const createdUserId = await this.blogsService.create(
      name, description, websiteUrl
    );

    const createdUser: BlogOutputModel | null =
      await this.blogsQueryRepository.getById(createdUserId);

    return createdUser;
  }

  @Put(':id')
  @HttpCode(204)
  async update(@Param('id') id: string, @Body() updateModel: BlogCreateModel) {
    const updatedResult = await this.blogsService.update(id, updateModel);

    if (!updatedResult) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
  // :id в декораторе говорит nest о том что это параметр
  // Можно прочитать с помощью @Param("id") и передать в property такое же название параметра
  // Если property не указать, то вернется объект @Param()
  @Delete(':id')
  // Для переопределения default статус кода https://docs.nestjs.com/controllers#status-code
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    const deletingResult: boolean = await this.blogsService.delete(id);

    if (!deletingResult) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
