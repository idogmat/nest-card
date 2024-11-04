import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import { QuestionInputModel } from '../model/input/question.input.model';
import { QuestionOutput } from '../model/output/question.output';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
  ) { }

  async createQuestion(question: QuestionInputModel): Promise<QuestionOutput | null> {
    const model = this.questionRepo.create(question);

    const savedQuestion = await this.questionRepo.save(model);
    // const result = { body: savedQuestion.body, correctAnswers: savedQuestion.correctAnswers };
    return savedQuestion;
  }

  async getQuestionById(id: string): Promise<Question | null> {
    const model = await this.questionRepo.findOneBy({ id: id });
    if (!model) {
      return null;
    }
    return model;
  }

  async deleteQuestion(device: Question): Promise<boolean> {
    const result = await this.questionRepo.remove(device);
    console.log(result);
    return !!result;
  };


  async updateQuestion(id: string, newModel: Partial<Question>) {
    await this.questionRepo.createQueryBuilder()
      .update(Question)
      .set({
        body: newModel.body,
        correctAnswers: newModel.correctAnswers,
        updatedAt: new Date()
      })
      .where("id = :id", { id })
      .execute();
  }

  async updatePublished(id: string, publushed: { published: boolean; }) {
    await this.questionRepo.createQueryBuilder()
      .update(Question)
      .set({
        published: publushed.published,
        updatedAt: new Date()
      })
      .where("id = :id", { id })
      .execute();
  }
}
