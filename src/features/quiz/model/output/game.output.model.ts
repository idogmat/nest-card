import { Game, GameStatus } from "../../domain/game.entity";

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


export class GameOutputModel {
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

export const GameOutputModelMapper = (g: Game): GameOutputModel => {
  const outputModel = new GameOutputModel();
  outputModel.id = g.id;
  outputModel.firstPlayerProgress = {
    answers: g.playersProgresses[0]?.answers?.map(a => ({
      questionId: a.questionId,
      addedAt: a.createdAt,
      answerStatus: a.answerStatus
    })) || [],
    player: {
      id: g.playersProgresses?.[0]?.playerAccountId,
      login: g.playersProgresses?.[0]?.login
    },
    score: g.playersProgresses?.[0]?.score
  };

  outputModel.secondPlayerProgress =
    g.playersProgresses?.[1]?.id
      ? {
        answers: g.playersProgresses?.[1]?.answers?.map(a => ({
          questionId: a.questionId,
          addedAt: a.createdAt,
          answerStatus: a.answerStatus
        })) || [],
        player: {
          id: g.playersProgresses?.[1]?.playerAccountId,
          login: g.playersProgresses?.[1]?.login
        },
        score: g.playersProgresses?.[1]?.score
      }
      : null;
  outputModel.status = GameStatus[g.status.toString()];
  outputModel.questions =
    g.questions?.length
      ? g.questions?.map(q => ({ id: q.id, body: q.question.body }))
      : null;
  outputModel.pairCreatedDate = g.createdAt;
  outputModel.startGameDate = g.startGameDate;
  outputModel.finishGameDate = g.finishGameDate;

  return outputModel;
};