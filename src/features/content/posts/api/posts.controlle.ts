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
} from '../../../../base/models/pagination.base.model';
import { SortingPropertiesType } from '../../../../base/types/sorting-properties.type';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostOutputModel } from './model/output/post.output.model';
import { PostCreateModel } from './model/input/create-post.input.model';
import { PostsService } from '../application/posts.service';
import { PostUpdateModel } from './model/input/update-post.input.model';
import { BasicAuthGuard } from 'src/common/guards/basic-auth.guard';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { LikeSetModel } from 'src/features/likes/api/model/input/like-post.input.model';
import { AuthGetGuard } from 'src/common/guards/auth-get.guard';
import { CommentOutputModel } from '../../comments/api/model/output/comment.output.model';
import { CommentsService } from '../../comments/application/comments.service';
import { BlogsQueryRepository } from '../../blogs/infrastructure/blogs.query-repository';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments.query-repository';
import { CommentCreateModel } from '../../comments/api/model/input/create-comment.input.model';
import { PostInBlogCreateModel } from '../../blogs/api/model/input/create-post.input.model';
import { EnhancedParseUUIDPipe } from 'src/common/pipes/uuid-check';

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

  // SA
  @UseGuards(AuthGetGuard)
  @Get('sa/posts')
  async getAllSa(
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
  // SA
  @UseGuards(BasicAuthGuard)
  @Post('sa/posts')
  async create(@Body() createModel: PostCreateModel) {
    const blog = await this.blogsQueryRepository.getById(createModel?.blogId);
    if (!blog) throw new NotFoundException();
    const { blogId, content, shortDescription, title } = createModel;

    const createdPostId = await this.postsService.create(
      blogId, content, shortDescription, title,
    );

    const createdPost: PostOutputModel | null =
      await this.postsQueryRepository.getById(createdPostId);

    return createdPost;
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

  @UseGuards(BasicAuthGuard)
  @Put('posts/:id')
  @HttpCode(204)
  async update(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
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
  @Delete('posts/:id')
  @HttpCode(204)
  async delete(@Param('id', new EnhancedParseUUIDPipe()) id: string) {
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


  @UseGuards(AuthGetGuard)
  @Get('sa/blogs/:blogId/posts/:postId')
  async getByIdSa(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Param('postId', new EnhancedParseUUIDPipe()) postId: string,
    @Req() req?
  ) {
    const blog = await this.blogsQueryRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    const post: PostOutputModel =
      await this.postsQueryRepository.getById(postId, req?.user?.userId);

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  // SA
  @UseGuards(BasicAuthGuard)
  @Put('sa/blogs/:blogId/posts/:postId')
  @HttpCode(204)
  async updateSa(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Param('postId', new EnhancedParseUUIDPipe()) postId: string,
    @Body() updateModel: PostInBlogCreateModel
  ) {
    const blog = await this.blogsQueryRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    const post = await this.postsService.getById(postId);
    if (!post) throw new NotFoundException();
    const updatedResult = await this.postsService.update(postId, updateModel);

    if (!updatedResult) {
      throw new NotFoundException(`User with id ${postId} not found`);
    }
  }
  // SA
  @UseGuards(BasicAuthGuard)
  @Delete('sa/blogs/:blogId/posts/:postId')
  @HttpCode(204)
  async deleteSa(
    @Param('blogId', new EnhancedParseUUIDPipe()) blogId: string,
    @Param('postId', new EnhancedParseUUIDPipe()) postId: string,
  ) {
    const blog = await this.blogsQueryRepository.getById(blogId);
    if (!blog) throw new NotFoundException();
    const post = await this.postsService.getById(postId);
    if (!post) {
      throw new NotFoundException();
    }
    const deletingResult: boolean = await this.postsService.delete(postId);

    if (!deletingResult) {
      throw new NotFoundException(`User with id ${postId} not found`);
    }
  }
}
