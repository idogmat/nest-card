import { Game, GameStatus } from "../../domain/game.entity";
import { Question } from "../../domain/question.entity";

interface IAnswer {
  questionId: string;
  answerStatus: string;
  addedAt;
}
interface IPlayer {
  id: string;
  login: string;
}
interface IQuestions {
  id: string,
  body: string;
}


export class QuestionOutputModel {
  id: string;
  firstPlayerProgress: {
    answers: IAnswer[];
    player: IPlayer;
    score: number;
  };
  secondPlayerProgress: {
    answers: IAnswer[] | [];
    player: IPlayer;
    score: number;
  };
  questions: IQuestions[];
  status: GameStatus;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
}

export const GameOutputModelMapper = (g: Game): QuestionOutputModel => {
  const outputModel = new QuestionOutputModel();
  outputModel.id = g.id;
  outputModel.firstPlayerProgress = {
    answers: g.playersProgresses[0].answers.map(a => ({
      questionId: a.questionId,
      addedAt: a.createdAt,
      answerStatus: a.answerStatus
    })) || [],
    player: {
      id: g.playersProgresses[0].id,
      login: g.playersProgresses[0].id
    },
    score: g.playersProgresses[0].score
  };
  outputModel.secondPlayerProgress = {
    answers: g.playersProgresses[1].answers.map(a => ({
      questionId: a.questionId,
      addedAt: a.createdAt,
      answerStatus: a.answerStatus
    })) || [],
    player: {
      id: g.playersProgresses[1].id,
      login: g.playersProgresses[1].id
    },
    score: g.playersProgresses[1].score
  };
  outputModel.status = GameStatus[g.status.toString()];
  outputModel.questions = g.questions.map(q => ({ id: q.id, body: q.question.body }));
  outputModel.pairCreatedDate = g.createdAt;
  outputModel.startGameDate = g.startGameDate;
  outputModel.finishGameDate = g.finishGameDate;

  return outputModel;
};