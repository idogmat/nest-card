import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BasicAuthGuard } from "src/utils/guards/basic-auth.guard";
import { QuestionInputModel } from "../model/input/question.input.model";
import { QuizService } from "../application/quiz.service";
import { PaginationQuestionBodySearchTerm, PaginationOutput } from "src/base/models/pagination.base.model";
import { SortingPropertiesType } from "src/base/types/sorting-properties.type";
import { Question } from "../domain/question.entity";
import { QuestionOutputModel } from "../model/output/question.output.model";
import { QuizQueryRepository } from "../infrastracture/quiz.query-repository";
import { EnhancedParseUUIDPipe } from "src/utils/pipes/uuid-check";
import { QuestionPublishedModel } from "../model/input/question.published.model";

export const QUESTIONS_SORTING_PROPERTIES: SortingPropertiesType<Question> =
  ['updatedAt', 'createdAt', 'body'];

@ApiTags('Quiz')
@Controller('/sa/quiz')
export class QuizSuperAdminController {
  constructor(
    private readonly quizService: QuizService,
    private readonly quizQueryRepository: QuizQueryRepository,
  ) { }

  // SA
  @UseGuards(BasicAuthGuard)
  @Post('/questions')
  async createQuestion(@Body() createModel: QuestionInputModel) {
    const question = await this.quizService.createQuestion(createModel);
    if (!question) throw new UnauthorizedException();

    return question;
  }

  @UseGuards(BasicAuthGuard)
  @Get('/questions')
  async getQuestions(
    @Query() query: any,
  ) {
    const pagination: PaginationQuestionBodySearchTerm =
      new PaginationQuestionBodySearchTerm(
        query,
        QUESTIONS_SORTING_PROPERTIES,
      );

    const questions: PaginationOutput<QuestionOutputModel> =
      await this.quizQueryRepository.getAll(pagination);

    return questions;
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/questions/:id')
  @HttpCode(204)
  async deleteQuestions(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
  ) {
    await this.quizService.delete(id);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/questions/:id/publish')
  @HttpCode(204)
  async updatePublish(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @Body() published: QuestionPublishedModel
  ) {
    await this.quizService.updatepPablished(id, published);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/questions/:id')
  @HttpCode(204)
  async updateQuestion(
    @Param('id', new EnhancedParseUUIDPipe()) id: string,
    @Body() updateModel: QuestionInputModel
  ) {
    await this.quizService.update(id, updateModel);
  }
}