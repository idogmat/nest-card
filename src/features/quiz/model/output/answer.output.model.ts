import { PlayerAnswer } from "../../domain/playerAnswer.entity";

export class AnswerOutputModel {
  questionId: string;
  answerStatus: string;
  addedAt: string;
}

export const AnswerOutputModelMapper = (a: PlayerAnswer): AnswerOutputModel => {
  const outputModel = new AnswerOutputModel();

  outputModel.questionId = a.questionId,
    outputModel.answerStatus = a.answerStatus,
    outputModel.addedAt = new Date(a.createdAt).toISOString();

  return outputModel;
};