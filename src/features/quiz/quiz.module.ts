import { Module } from "@nestjs/common";
import { UserModule } from "../users/users.module";
import { QuizController } from "./api/quiz.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Game } from "./domain/game.entity";
import { PlayerProgress } from "./domain/player.entity";
import { Question } from "./domain/question.entity";
import { QuestionOfTheGame } from "./domain/questionsForGame.entity";
import { QuizService } from "./application/quiz.service";
import { QuizRepository } from "./infrastracture/quiz.repository";
import { QuizQueryRepository } from "./infrastracture/quiz.query-repository";

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Game, PlayerProgress, QuestionOfTheGame, Question])],
  controllers: [QuizController],
  providers: [QuizService, QuizRepository, QuizQueryRepository],
  exports: []
})
export class QuizModule { }
