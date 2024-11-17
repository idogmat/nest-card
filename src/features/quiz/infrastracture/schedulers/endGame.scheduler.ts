import { Injectable } from '@nestjs/common';
import { QuizGameRepository } from '../quiz.game.repository';

@Injectable()
export class EndGameService {
  constructor(private readonly gameRepo: QuizGameRepository,) { }
  executeTaskWithDelay(endGameTimerId) {
    setTimeout(() => {
      this.gameRepo.finishGame(endGameTimerId);
    }, 10000);
  }
}