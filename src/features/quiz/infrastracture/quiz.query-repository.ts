import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import { QuestionOutputModel, QuestionOutputModelMapper } from '../model/output/question.output.model';
import { PaginationOutput, PaginationQuestionBodySearchTerm } from 'src/base/models/pagination.base.model';

@Injectable()
export class QuizQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) { }

  async getAll(
    pagination: PaginationQuestionBodySearchTerm,
  ): Promise<PaginationOutput<QuestionOutputModel>> {
    const conditions = [];
    const params = [];

    const questionQueryBuilder = this.questionsRepository.createQueryBuilder("q");

    if (pagination.bodySearchTerm) {
      conditions.push("q.body ilike :body");
      params.push({ body: `%${pagination.bodySearchTerm}%` });
    }
    if (pagination.publishedStatus !== null) {
      conditions.push("q.published = :published");
      params.push({ published: `${pagination.publishedStatus}` });
    }

    if (conditions.length > 0) {
      conditions.forEach((condition, i) => {
        if (i === 0)
          questionQueryBuilder.where(condition, params[i]);
        if (i === 1)
          questionQueryBuilder.andWhere(condition, params[i]);
      });
    }

    const totalCount = await questionQueryBuilder.getCount();
    const questions = await questionQueryBuilder
      .orderBy(`q.${pagination.sortBy}`, pagination.sortDirection)
      .limit(pagination.pageSize)
      .offset((pagination.pageNumber - 1) * pagination.pageSize)
      .getMany();

    const mappedQuestions = questions.map(e => QuestionOutputModelMapper(e));
    return new PaginationOutput<QuestionOutputModel>(
      mappedQuestions,
      pagination.pageNumber,
      pagination.pageSize,
      Number(totalCount),
    );
  }
}
