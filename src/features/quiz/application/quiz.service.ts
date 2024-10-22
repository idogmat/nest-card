import { Injectable } from "@nestjs/common";
import { QuestionInputModel } from "../model/input/question.input.model";
import { QuizRepository } from "../infrastracture/quiz.repository";

@Injectable()
export class QuizService {
  constructor(
    private readonly quizRepository: QuizRepository
  ) { }

  async createQuestion(model: QuestionInputModel): Promise<string> {
    const question = {
      ...model,
      published: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const createdUserId: string = await this.quizRepository.createQuestion(question);

    return createdUserId;
  }
}