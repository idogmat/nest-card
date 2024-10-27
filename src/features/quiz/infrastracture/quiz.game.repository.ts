import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Equal, LessThan, Not, Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import { QuestionInputModel } from '../model/input/question.input.model';
import { UserPg } from 'src/features/users/domain/user.entity';
import { Game, GameStatus } from '../domain/game.entity';
import { PlayerProgress } from '../domain/player.entity';

@Injectable()
export class QuizGameRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,

    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
    @InjectRepository(PlayerProgress)
    private readonly playerRepo: Repository<PlayerProgress>,
  ) { }

  async createGame(userId: string): Promise<string | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let result = null;
    try {
      const game = this.gameRepo.create({ createdAt: new Date() });
      await queryRunner.manager.save(game);
      const player = this.playerRepo.create({ gameId: game.id, playerAccountId: userId, createdAt: new Date() });
      await queryRunner.manager.save(player);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    result = await this.gameRepo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.playersProgresses', 'playerProgress')
      .where(qb => {
        const subQuery = qb.subQuery()
          .select('playerProgress.gameId')
          .from('PlayerProgress', 'playerProgress')
          .where('playerProgress.playerAccountId = :excludedPlayerAccountId', { excludedPlayerAccountId: userId })
          .groupBy('playerProgress.gameId')
          .having('COUNT(playerProgress.id) < :maxPlayers', { maxPlayers: 2 })
          .getQuery();
        return 'game.id IN ' + subQuery;
      }).orderBy(`game."createdAt"`, `ASC`).getOne();
    return result;
  }

  async findGame(userId: string): Promise<any> {
    let gameId = null;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const queryGetGames = this.gameRepo
        .createQueryBuilder('game')
        .leftJoinAndSelect('game.playersProgresses', 'playerProgress')
        .where(qb => {
          const subQuery = qb.subQuery()
            .select('playerProgress.gameId')
            .from('PlayerProgress', 'playerProgress')
            .where('playerProgress.playerAccountId != :excludedPlayerAccountId', { excludedPlayerAccountId: userId })
            .groupBy('playerProgress.gameId')
            .having('COUNT(playerProgress.id) < :maxPlayers', { maxPlayers: 1 })
            .getQuery();
          return 'game.id IN ' + subQuery;
        }).where(`game.status = :status`, { status: GameStatus.PendingSecondUser });

      const games = await queryGetGames.orderBy(`game."createdAt"`, `ASC`).getMany();

      if (!games?.[0]) {
        return null;
      }

      gameId = games?.[0].id;
      const player = this.playerRepo.create({ gameId: games[0].id, playerAccountId: userId, createdAt: new Date() });
      await queryRunner.manager.save(player);

      await this.gameRepo
        .createQueryBuilder('game')
        .update(Game)
        .andWhere(`game.id = :id`, { id: games[0].id })
        .set({ status: GameStatus.Active })
        .execute();

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    const game = await this.gameRepo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.playersProgresses', 'playerProgress')
      .where(qb => {
        const subQuery = qb.subQuery()
          .select('playerProgress.gameId')
          .from('PlayerProgress', 'playerProgress')
          .where('playerProgress.playerAccountId != :excludedPlayerAccountId', { excludedPlayerAccountId: userId })
          .groupBy('playerProgress.gameId')
          .having('COUNT(playerProgress.id) < :maxPlayers', { maxPlayers: 1 })
          .getQuery();
        return 'game.id IN ' + subQuery;
      })
      .andWhere(`game.id = :id`, { id: gameId })
      .getOne();

    console.log(game);
    return game;
  }

  // async deleteQuestion(device: Question): Promise<boolean> {
  //   const result = await this.questionRepo.remove(device);
  //   console.log(result);
  //   return !!result;
  // };


  // async updateQuestion(id: string, newModel: Partial<Question>) {
  //   await this.questionRepo.createQueryBuilder()
  //     .update(Question)
  //     .set({
  //       body: newModel.body,
  //       correctAnswers: newModel.correctAnswers,
  //     })
  //     .where("id = :id", { id })
  //     .execute();
  // }

  // async updatePublished(id: string, publushed: { published: boolean; }) {
  //   await this.questionRepo.createQueryBuilder()
  //     .update(Question)
  //     .set({
  //       published: publushed.published,
  //     })
  //     .where("id = :id", { id })
  //     .execute();
  // }
}
