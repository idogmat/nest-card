import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SortingPropertiesType } from "src/base/types/sorting-properties.type";
import { Question } from "../domain/question.entity";

import { QuizGameService } from "../application/quiz.game.service";
import { JwtAuthGuard } from "src/features/auth/guards/jwt-auth.guard";
import { AnswerInputModel } from "../model/input/answer.input.model";
import { EnhancedParseUUIDPipe } from "src/common/pipes/uuid-check";

export const QUESTIONS_SORTING_PROPERTIES: SortingPropertiesType<Question> =
  ['updatedAt', 'createdAt'];

@ApiTags('Quiz')
@Controller()
export class QuizController {
  constructor(
    private readonly quizGameService: QuizGameService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('/pair-game-quiz/pairs/connection')
  async getPair(@Req() req) {
    console.log('ok');
    const pairGame = await this.quizGameService.getPair(req.user);
    // if (!pairGame) throw new UnauthorizedException();

    return pairGame;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/pair-game-quiz/pairs/my-current')
  async getCurrentGame(@Req() req) {
    console.log('ok');
    const pairGame = await this.quizGameService.getCurrentGame(req.user);
    // if (!pairGame) throw new UnauthorizedException();

    return pairGame;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/pair-game-quiz/pairs/:id')
  async getGameById(
    @Req() req,
    @Param('id', new EnhancedParseUUIDPipe(400)) id: string,
  ) {
    console.log('ok');
    const pairGame = await this.quizGameService.getGameById(id, req.user);
    // if (!pairGame) throw new UnauthorizedException();

    return pairGame;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/pair-game-quiz/pairs/my-current/answers')
  async deleteQuestions(
    @Req() req,
    @Body() answer: AnswerInputModel
  ) {
    const settedAnswer = await this.quizGameService.setAnswer(req.user, answer.answer);
    return settedAnswer;
  }

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