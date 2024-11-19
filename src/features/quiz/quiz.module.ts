import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Game } from "./domain/game.entity";
import { PlayerProgress } from "./domain/player.entity";
import { Question } from "./domain/question.entity";
import { QuestionOfTheGame } from "./domain/questionsForGame.entity";
import { QuizService } from "./application/quiz.service";
import { QuizRepository } from "./infrastracture/quiz.repository";
import { QuizQueryRepository } from "./infrastracture/quiz.query-repository";
import { QuizSuperAdminController } from "./api/quiz.sa.controller";
import { QuizController } from "./api/quiz.controller";
import { QuizGameService } from "./application/quiz.game.service";
import { QuizGameRepository } from "./infrastracture/quiz.game.repository";
import { PlayerAnswer } from "./domain/playerAnswer.entity";
import { CqrsModule } from "@nestjs/cqrs";
import { GetGamePairUseCase } from "./application/game-case/game.find-pair.use-case";
import { CreateGamePairUseCase } from "./application/game-case/game.create-pair.use-case";
import { QuizGameQueryRepository } from "./infrastracture/quiz.game.query-repository";
import { EndGameService } from "./infrastracture/schedulers/endGame.scheduler";
import { SetAnswerUseCase } from "./application/game-case/game.set-answer.use-case";
import { TransactionManager } from "src/utils/transaction/transactionManager";

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      Game,
      PlayerProgress,
      QuestionOfTheGame,
      Question,
      PlayerAnswer
    ])
  ],
  controllers: [
    QuizSuperAdminController,
    QuizController
  ],
  providers: [
    QuizService,
    QuizGameService,
    QuizRepository,
    QuizGameRepository,
    QuizQueryRepository,
    QuizGameQueryRepository,
    GetGamePairUseCase,
    SetAnswerUseCase,
    CreateGamePairUseCase,
    EndGameService,
    TransactionManager
  ],
  exports: []
})
export class QuizModule { }
