import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
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
} from '../../../../base/models/pagination.base.model';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostOutputModel } from './model/output/post.output.model';
import { PostsService } from '../application/posts.service';
import { JwtAuthGuard } from './../../../../features/auth/guards/jwt-auth.guard';
import { LikeSetModel } from './../../../../features/likes/api/model/input/like-post.input.model';
import { AuthGetGuard } from '../../../../utils/guards/auth-get.guard';
import { CommentOutputModel } from '../../comments/api/model/output/comment.output.model';
import { CommentsService } from '../../comments/application/comments.service';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query-repository';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';
import { CommentCreateModel } from '../../comments/api/model/input/create-comment.input.model';
import { EnhancedParseUUIDPipe } from '../../../../utils/pipes/uuid-check';

export const POSTS_SORTING_PROPERTIES: SortingPropertiesType<PostOutputModel> =
  [
    'title',
    'blogId',
    'blogName',
    'content',
    'createdAt'
  ];

export const COMMENTS_SORTING_PROPERTIES: SortingPropertiesType<CommentOutputModel> =
  ['content', 'createdAt'];

@ApiTags('Posts')
@Controller()
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) { }

  @UseGuards(AuthGetGuard)
  @Get('posts')
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
  @Get('posts/:id')
  async getById(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @Req() req?
  ) {
    const post: PostOutputModel =
      await this.postsQueryRepository.getById(id, req?.user?.userId);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @UseGuards(AuthGetGuard)
  @Get('posts/:id/comments')
  async getComments(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
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
  @Post('posts/:id/comments')
  async createComment(
    @Req() req,
    @Param('id', new EnhancedParseUUIDPipe()) postId: string,
    @Body() createModel: CommentCreateModel) {
    const post = await this.postsQueryRepository.getById(postId);
    if (!post) throw new NotFoundException();
    const { content } = createModel;

    const createdComment = await this.commentsService.create(
      postId, content, req.user.userId, req.user.login
    );

    return createdComment;
  }

  @UseGuards(JwtAuthGuard)
  @Put('posts/:id/like-status')
  @HttpCode(204)
  async setLikeStatus(
    @Req() req,
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @Body() like: LikeSetModel
  ) {
    const post = await this.postsService.getById(id);
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
