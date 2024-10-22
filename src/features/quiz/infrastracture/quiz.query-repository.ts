import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../domain/question.entity';

@Injectable()
export class QuizQueryRepository {
  constructor(
    @InjectRepository(Question)
    private readonly deviceRepo: Repository<Question>,
  ) { }

  // async getAll(
  //   userId: string
  // ): Promise<DeviceOutputModel[] | []> {
  //   const devices = await this.deviceRepo.createQueryBuilder("d")
  //     .where("d.userId = :userId", { userId })
  //     .orderBy("d.lastActiveDate")
  //     .getMany();

  //   const mappedComments = devices.map(e => DeviceOutputModelMapper(e));
  //   return mappedComments;
  // }
}
