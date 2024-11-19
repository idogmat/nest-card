import { Injectable } from "@nestjs/common";
import { QuizGameRepository } from "../infrastracture/quiz.game.repository";
import { EndGameService } from "../infrastracture/schedulers/endGame.scheduler";
import { AuthUser } from "src/features/auth/auth.module";

@Injectable()
export class QuizGameService {
  constructor(
    private readonly quizGameRepository: QuizGameRepository,
    private readonly endGameService: EndGameService

  ) { }

  async getCurrentGame(user: AuthUser): Promise<string> {
    const game = await this.quizGameRepository.findGame(user);
    return game;
  }

  async getGameById(id: string, user: AuthUser): Promise<string> {
    const game = await this.quizGameRepository.getGameById(id, user);
    return game;
  }
}