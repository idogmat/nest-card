import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SortingPropertiesType } from "src/base/types/sorting-properties.type";
import { Question } from "../domain/question.entity";
import { QuizGameService } from "../application/quiz.game.service";
import { JwtAuthGuard } from "src/features/auth/guards/jwt-auth.guard";
import { AnswerInputModel } from "../model/input/answer.input.model";
import { EnhancedParseUUIDPipe } from "../../../utils/pipes/uuid-check";
import { CommandBus } from "@nestjs/cqrs";
import { CreateGamePairCommand } from "../application/game-case/game.create-pair.use-case";
import { GetGamePairCommand } from "../application/game-case/game.find-pair.use-case";
import { QuizGameQueryRepository } from "../infrastracture/quiz.game.query-repository";
import { Game } from "../domain/game.entity";
import { Pagination, PaginationAllStatistic, PaginationOutput } from "src/base/models/pagination.base.model";
import { GameOutputModel } from "../model/output/game.output.model";
import { MyStatistic } from "../model/output/my-statistic.output.model";

export const QUESTIONS_SORTING_PROPERTIES: SortingPropertiesType<Question> =
  ['updatedAt', 'createdAt'];

export const GAME_SORTING_PROPERTIES: SortingPropertiesType<Game> =
  ['createdAt', 'status'];

@ApiTags('Quiz')
@Controller()
export class QuizController {
  constructor(
    private readonly quizGameService: QuizGameService,
    private readonly quizGameQueryRepository: QuizGameQueryRepository,
    private commandBus: CommandBus
  ) { }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('/pair-game-quiz/pairs/connection')
  async getPair(@Req() req) {
    const game = await this.commandBus.execute(new GetGamePairCommand(req.user));
    if (game) {
      return game;
    } else {
      const createdGame = await this.commandBus.execute(new CreateGamePairCommand(req.user));;
      return createdGame;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/pair-game-quiz/pairs/my')
  async getMyGames(
    @Req() req,
    @Query() query: any,
  ) {
    const pagination: Pagination =
      new Pagination(
        query,
        GAME_SORTING_PROPERTIES,
      );

    const games: PaginationOutput<GameOutputModel> =
      await this.quizGameQueryRepository.getAll(pagination, req.user);

    return games;

  }

  @UseGuards(JwtAuthGuard)
  @Get('/pair-game-quiz/users/my-statistic')
  async getMyStatistic(
    @Req() req,
  ) {
    const statistic: MyStatistic =
      await this.quizGameQueryRepository.getMyStatistic(req.user);

    return statistic;
  }

  @Get('/pair-game-quiz/users/top')
  async allMyStatistic(
    @Query() query: any,
  ) {
    const pagination: PaginationAllStatistic =
      new PaginationAllStatistic(
        query,
        GAME_SORTING_PROPERTIES,
      );
    const statistic: any =
      await this.quizGameQueryRepository.getAllStatistic(pagination);

    return statistic;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('/pair-game-quiz/pairs/my-current')
  async getCurrentGame(@Req() req) {
    const pairGame = await this.quizGameService.getCurrentGame(req.user);
    return pairGame;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/pair-game-quiz/pairs/:id')
  async getGameById(
    @Req() req,
    @Param('id', new EnhancedParseUUIDPipe(400)) id: string,
  ) {
    const pairGame = await this.quizGameService.getGameById(id, req.user);
    return pairGame;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('/pair-game-quiz/pairs/my-current/answers')
  async aetAnswer(
    @Req() req,
    @Body() answer: AnswerInputModel
  ) {
    const settedAnswer = await this.quizGameService.setAnswer(req.user, answer.answer);
    return settedAnswer;
  }
}