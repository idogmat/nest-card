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
  Pagination,
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
import { BasicAuthGuard } from 'src/common/guards/basic-auth.guard';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { LikeSetModel } from 'src/features/likes/api/model/input/like-post.input.model';
import { AuthGetGuard } from 'src/common/guards/auth-get.guard';
import { CommentCreateModel } from 'src/features/comments/api/model/input/create-comment.input.model';
import { CommentsService } from 'src/features/comments/application/comments.service';
import { CommentsQueryRepository } from 'src/features/comments/infrastructure/comments.query-repository';
import { CommentOutputModel } from 'src/features/comments/api/model/output/comment.output.model';

export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
  ['title', 'blogId', 'blogName', 'content', 'createdAt'];

export const COMMENTS_SORTING_PROPERTIES: SortingPropertiesType<CommentOutputModel> =
  ['content', 'createdAt'];

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
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
        POSTS_SORTING_PROPERTIES,
      );

    const posts: PaginationOutput<PostOutputModel> =
      await this.postsQueryRepository.getAll(pagination, '', req?.user?.userId);

    return posts;
  }

  @UseGuards(AuthGetGuard)
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Req() req?
  ) {
    const post: PostOutputModel =
      await this.postsQueryRepository.getById(id, req?.user?.userId);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @UseGuards(BasicAuthGuard)
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

  @UseGuards(AuthGetGuard)
  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query() query: any,
    @Req() req?
  ) {
    const post = await this.postsQueryRepository.getById(id);
    if (!post) throw new NotFoundException();
    const pagination: Pagination =
      new Pagination(
        query,
        COMMENTS_SORTING_PROPERTIES,
      );

    const comments: PaginationOutput<CommentOutputModel> =
      await this.commentsQueryRepository.getAll(pagination, id, req?.user?.userId);

    return comments;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async createComment(
    @Req() req,
    @Param('id') id: string,
    @Body() createModel: CommentCreateModel) {
    const post = await this.postsQueryRepository.getById(id);
    if (!post) throw new NotFoundException();
    const { content } = createModel;

    const createdComment = await this.commentsService.create(
      id, content, req.user.userId, req.user.login
    );

    return createdComment;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async update(
    @Param('id') id: string,
    @Body() updateModel: PostUpdateModel
  ) {
    const post = await this.postsService.getById(id);
    if (!post) throw new NotFoundException();
    const updatedResult = await this.postsService.update(id, updateModel);

    if (!updatedResult) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    const post = await this.postsService.getById(id);
    if (!post) {
      throw new NotFoundException();
    }
    const deletingResult: boolean = await this.postsService.delete(id);

    if (!deletingResult) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async setLikeStatus(
    @Req() req,
    @Param('id') id: string,
    @Body() like: LikeSetModel
  ) {
    const post = await this.postsService.getById(req.params.id);
    if (!post) {
      throw new NotFoundException();
    }
    await this.postsService.setLike(
      id,
      req.user,
      like.likeStatus,
    );
  }
}
