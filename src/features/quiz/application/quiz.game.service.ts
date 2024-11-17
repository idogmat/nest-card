import { Injectable } from "@nestjs/common";
import { QuizGameRepository } from "../infrastracture/quiz.game.repository";
import { AuthUser } from "../quiz.module";
import { EndGameService } from "../infrastracture/schedulers/endGame.scheduler";

@Injectable()
export class QuizGameService {
  constructor(
    private readonly quizGameRepository: QuizGameRepository,
    private readonly endGameService: EndGameService

  ) { }

  async getPair(user: AuthUser): Promise<string> {
    const game = await this.quizGameRepository.findPair(user);
    if (game) {
      return game;
    } else {
      const createdGame = await this.quizGameRepository.createGame(user);
      return createdGame;
    }
  }

  async getCurrentGame(user: AuthUser): Promise<string> {
    const game = await this.quizGameRepository.findGame(user);
    return game;
  }

  async getGameById(id: string, user: AuthUser): Promise<string> {
    // this.endGameService.executeTaskWithDelay('7c8924c7-76eb-4580-a1a4-1576bc2c6625');

    const game = await this.quizGameRepository.getGameById(id, user);
    return game;
  }

  async setAnswer(user: AuthUser, answer: string): Promise<string> {
    const settedAnswer = await this.quizGameRepository.setAnswer(user, answer);
    const { result, endGameTimerId } = settedAnswer;
    if (endGameTimerId) {
      console.log(endGameTimerId);
      this.endGameService.executeTaskWithDelay(endGameTimerId);
    }
    return result;
  }
}