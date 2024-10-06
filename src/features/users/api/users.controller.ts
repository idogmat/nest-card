import { ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { UsersService } from '../application/users.service';
import { UserCreateModel } from './models/input/create-user.input.model';
import { UserOutputModel } from './models/output/user.output.model';
import {
  PaginationOutput,
  PaginationWithSearchLoginAndEmailTerm,
} from '../../../base/models/pagination.base.model';
import { SortingPropertiesType } from '../../../base/types/sorting-properties.type';
import { BasicAuthGuard } from 'src/common/guards/basic-auth.guard';
import { EnhancedParseUUIDPipe } from 'src/common/pipes/uuid-check';

export const USERS_SORTING_PROPERTIES: SortingPropertiesType<UserOutputModel> =
  ['login', 'email', 'createdAt'];

// Tag для swagger
@ApiTags('Users')
@Controller('sa/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) { }

  @Get()
  // @UseGuards(AuthGuard)
  async getAll(
    // Для работы с query
    @Query() query: any,
  ) {
    const pagination: PaginationWithSearchLoginAndEmailTerm =
      new PaginationWithSearchLoginAndEmailTerm(
        query,
        USERS_SORTING_PROPERTIES,
      );

    const users: PaginationOutput<UserOutputModel> =
      await this.usersQueryRepository.getAll(pagination);

    return users;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async create(@Body() createModel: UserCreateModel) {
    const { login, password, email } = createModel;
    const user = await this.usersService.findByLoginAndEmail(login, email);
    if (user) throw new BadRequestException();
    const createdUserId = await this.usersService.create(
      login,
      password,
      email,
    );

    const createdUser: UserOutputModel | null =
      await this.usersQueryRepository.getById(createdUserId);

    return createdUser;
  }


  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', new EnhancedParseUUIDPipe()) id: string) {
    const deletingResult: boolean = await this.usersService.delete(id);

    if (!deletingResult) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  @UseGuards(BasicAuthGuard)
  @Get(':id')
  async getById(@Param('id', new EnhancedParseUUIDPipe()) id: string) {
    const createdUser: UserOutputModel | null =
      await this.usersQueryRepository.getById(id);

    return createdUser;
  }
}
