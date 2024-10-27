import { Injectable } from "@nestjs/common";
import { QuizGameRepository } from "../infrastracture/quiz.game.repository";

@Injectable()
export class QuizGameService {
  constructor(
    private readonly quizGameRepository: QuizGameRepository
  ) { }

  async getPair(userId: string): Promise<string> {
    const game = await this.quizGameRepository.findGame(userId);
    if (game) {
      return game;
    } else {
      const createdGame = await this.quizGameRepository.createGame(userId);
      return createdGame;
    }
  }
}