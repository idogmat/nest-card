import { Question } from "../../domain/question.entity";

export class QuestionOutputModel {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const QuestionOutputModelMapper = (q: Question): QuestionOutputModel => {
  const outputModel = new QuestionOutputModel();
  outputModel.id = q.id;
  outputModel.body = q.body;
  outputModel.correctAnswers = q.correctAnswers;
  outputModel.published = q.published;
  outputModel.createdAt = q.createdAt;
  outputModel.updatedAt = q.updatedAt;

  return outputModel;
};