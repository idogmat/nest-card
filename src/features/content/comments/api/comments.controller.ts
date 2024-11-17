import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentOutputModel } from './model/output/comment.output.model';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { JwtAuthGuard } from 'src/features/auth/guards/jwt-auth.guard';
import { LikeSetModel } from 'src/features/likes/api/model/input/like-post.input.model';
import { CommentsService } from '../application/comments.service';
import { AuthGetGuard } from 'src/common/guards/auth-get.guard';
import { CommentCreateModel } from './model/input/create-comment.input.model';
import { EnhancedParseUUIDPipe } from 'src/common/pipes/uuid-check';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentsService: CommentsService,
  ) { }

  @UseGuards(AuthGetGuard)
  @Get(':id')
  async getById(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @Req() req?
  ) {
    const comment: CommentOutputModel =
      await this.commentsQueryRepository.getById(id, req?.user?.userId);
    if (!comment) throw new NotFoundException;
    return comment;
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async update(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @Body() updateModel: CommentCreateModel,
    @Req() req?
  ) {
    const comment = await this.commentsService.getById(id);
    if (!comment) throw new NotFoundException();

    if (comment.userId !== req?.user?.userId) {
      throw new ForbiddenException();
    }

    const updatedResult = await this.commentsService.update(id, updateModel);

    if (!updatedResult) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async setLikeStatus(
    @Req() req,
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @Body() like: LikeSetModel
  ) {
    const comment = await this.commentsService.getById(id);
    if (!comment) throw new NotFoundException();
    await this.commentsService.setLike(
      id,
      req.user,
      like.likeStatus,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @Req() req,
  ) {
    const comment = await this.commentsService.getById(id);
    if (!comment) {
      throw new NotFoundException();
    }

    if (comment.userId !== req?.user?.userId) {
      throw new ForbiddenException();
    }
    const deletingResult: boolean = await this.commentsService.delete(id);

    if (!deletingResult) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
