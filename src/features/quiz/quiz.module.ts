import { Module } from "@nestjs/common";
import { UserModule } from "../users/users.module";
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

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Game, PlayerProgress, QuestionOfTheGame, Question])],
  controllers: [QuizSuperAdminController, QuizController],
  providers: [QuizService, QuizGameService, QuizRepository, QuizGameRepository, QuizQueryRepository],
  exports: []
})
export class QuizModule { }
