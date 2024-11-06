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
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
}

export const GameOutputModelMapper = (g: Game): GameOutputModel => {
  const outputModel = new GameOutputModel();
  outputModel.id = g.id;
  outputModel.firstPlayerProgress = {
    answers: g.playersProgresses[0]?.answers?.map(a => ({
      questionId: a.questionId,
      addedAt: new Date(a.createdAt).toISOString(),
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
          addedAt: new Date(a.createdAt).toISOString(),
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
  outputModel.pairCreatedDate = new Date(g.createdAt).toISOString();
  outputModel.startGameDate = g.startGameDate ? new Date(g.startGameDate).toISOString() : null;
  outputModel.finishGameDate = g.finishGameDate ? new Date(g.finishGameDate).toISOString() : null;

  return outputModel;
};