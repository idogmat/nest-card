import { Injectable } from "@nestjs/common";
import { QuizGameRepository } from "../infrastracture/quiz.game.repository";
import { AuthUser } from "../quiz.module";

@Injectable()
export class QuizGameService {
  constructor(
    private readonly quizGameRepository: QuizGameRepository
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
    const game = await this.quizGameRepository.getGameById(id, user);
    return game;
  }

  async setAnswer(user: AuthUser, answer: string): Promise<string> {
    const settedAnswer = await this.quizGameRepository.setAnswer(user, answer);
    return settedAnswer;
  }
}