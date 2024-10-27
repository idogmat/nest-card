import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { QuestionInputModel } from "../model/input/question.input.model";
import { QuizRepository } from "../infrastracture/quiz.repository";
import { Question } from "../domain/question.entity";

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

  async delete(id: string): Promise<boolean> {
    const question = await this.quizRepository.getQuestionById(id);
    if (!question) {
      throw new NotFoundException();
    }
    return this.quizRepository.deleteQuestion(question);
  }

  async update(id: string, newModel: Partial<Question>): Promise<void> {
    const question = await this.quizRepository.getQuestionById(id);
    if (!question) {
      throw new NotFoundException();
    }
    if (question.published) {
      throw new BadRequestException();
    }
    await this.quizRepository.updateQuestion(id, newModel);
  }

  async updatepPablished(id: string, publushed: { published: boolean; }): Promise<void> {
    const question = await this.quizRepository.getQuestionById(id);
    if (!question) {
      throw new NotFoundException();
    }
    await this.quizRepository.updatePublished(id, publushed);
  }
}