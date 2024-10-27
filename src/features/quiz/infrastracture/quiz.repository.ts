import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import { QuestionInputModel } from '../model/input/question.input.model';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
  ) { }

  async createQuestion(question: QuestionInputModel): Promise<string | null> {
    const model = this.questionRepo.create(question);

    const savedDevice = await this.questionRepo.save(model);
    return savedDevice.id;
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
      })
      .where("id = :id", { id })
      .execute();
  }

  async updatePublished(id: string, publushed: { published: boolean; }) {
    await this.questionRepo.createQueryBuilder()
      .update(Question)
      .set({
        published: publushed.published,
      })
      .where("id = :id", { id })
      .execute();
  }
}
