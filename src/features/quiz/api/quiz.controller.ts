import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BasicAuthGuard } from "src/common/guards/basic-auth.guard";
import { QuestionInputModel } from "../model/input/question.input.model";
import { PaginationQuestionBodySearchTerm, PaginationOutput } from "src/base/models/pagination.base.model";
import { SortingPropertiesType } from "src/base/types/sorting-properties.type";
import { Question } from "../domain/question.entity";
import { QuestionOutputModel } from "../model/output/question.output.model";
import { EnhancedParseUUIDPipe } from "src/common/pipes/uuid-check";
import { QuestionPublishedModel } from "../model/input/question.published.model";
import { QuizGameService } from "../application/quiz.game.service";
import { JwtAuthGuard } from "src/features/auth/guards/jwt-auth.guard";

export const QUESTIONS_SORTING_PROPERTIES: SortingPropertiesType<Question> =
  ['updatedAt', 'createdAt'];

@ApiTags('Quiz')
@Controller()
export class QuizController {
  constructor(
    private readonly quizGameService: QuizGameService,
  ) { }

  // SA
  @UseGuards(JwtAuthGuard)
  @Post('/pair-game-quiz/pairs/connection')
  async getPair(@Req() req) {
    console.log('ok');
    const pairGame = await this.quizGameService.getPair(req.user.userId);
    // if (!pairGame) throw new UnauthorizedException();

    return pairGame;
  }

  // @UseGuards(BasicAuthGuard)
  // @Get('/sa/quiz/questions')
  // async getQuestions(
  //   @Query() query: any,
  // ) {
  //   const pagination: PaginationQuestionBodySearchTerm =
  //     new PaginationQuestionBodySearchTerm(
  //       query,
  //       QUESTIONS_SORTING_PROPERTIES,
  //     );

  //   const questions: PaginationOutput<QuestionOutputModel> =
  //     await this.quizQueryRepository.getAll(pagination);

  //   return questions;
  // }

  // @UseGuards(BasicAuthGuard)
  // @Delete('/sa/quiz/questions/:id')
  // @HttpCode(204)
  // async deleteQuestions(
  //   @Param('id') id: string,
  // ) {
  //   await this.quizService.delete(id);
  // }

  // @UseGuards(BasicAuthGuard)
  // @Put('/sa/quiz/questions/:id/publish')
  // @HttpCode(204)
  // async updatePublish(
  //   @Param('id', new EnhancedParseUUIDPipe()) id: string,
  //   @Body() published: QuestionPublishedModel
  // ) {
  //   await this.quizService.updatepPablished(id, published);
  // }

  // @UseGuards(BasicAuthGuard)
  // @Put('/sa/quiz/questions/:id')
  // @HttpCode(204)
  // async updateQuestion(
  //   @Param('id', new EnhancedParseUUIDPipe()) id: string,
  //   @Body() updateModel: QuestionInputModel
  // ) {
  //   await this.quizService.update(id, updateModel);
  // }
}