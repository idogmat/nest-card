import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { CommentOutputModel } from './model/output/comment.output.model';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';


@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) { }

  @Get(':id')
  async getById(
    @Param('id') id: string,
  ) {
    const comment: CommentOutputModel =
      await this.commentsQueryRepository.getById(id);

    return comment;
  }


}
