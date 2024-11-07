import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DataSource, Repository } from "typeorm";
import { Game, GameStatus } from "../../domain/game.entity";
import { ForbiddenException } from "@nestjs/common";
import { PlayerProgress } from "../../domain/player.entity";
import { GameOutputModel, GameOutputModelMapper } from "../../model/output/game.output.model";
import { QuestionOfTheGame } from "../../domain/questionsForGame.entity";
import { Question } from "../../domain/question.entity";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";

export class GetGamePairCommand {
  constructor(
    public readonly user: { userId: string, login: string; }
  ) { }
}

@CommandHandler(GetGamePairCommand)
export class GetGamePairUseCase implements ICommandHandler<GetGamePairCommand> {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
    @InjectRepository(PlayerProgress)
    private readonly playerRepo: Repository<PlayerProgress>,
    @InjectRepository(Question)
    private readonly questionsRepo: Repository<Question>,
    @InjectRepository(QuestionOfTheGame)
    private readonly questionsOfTheGameRepo: Repository<QuestionOfTheGame>,
  ) { }

  async execute(command: GetGamePairCommand): Promise<boolean | GameOutputModel> {
    const { user } = command;
    const currentGame = await this.gameRepo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.playersProgresses', 'playerProgress')
      .where(qb => {
        const subQuery = qb.subQuery()
          .select('playerProgress.gameId')
          .from('PlayerProgress', 'playerProgress')
          .where('"playerProgress"."playerAccountId" = :excludedPlayerAccountId', { excludedPlayerAccountId: user.userId })
          .groupBy('"playerProgress"."gameId"')
          .getQuery();
        return 'game.id IN ' + subQuery;
      })
      .andWhere(`game.status != :status`, { status: GameStatus.Finished })
      .orderBy(`game."createdAt"`, `DESC`)
      .addOrderBy('"playerProgress"."createdAt"', 'ASC')
      .getOne();
    if (currentGame) throw new ForbiddenException();
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
            .where('"playerProgress"."playerAccountId" != :excludedPlayerAccountId', { excludedPlayerAccountId: user.userId })
            .groupBy('"playerProgress"."gameId"')
            .having('COUNT("playerProgress".id) < :maxPlayers', { maxPlayers: 1 })
            .getQuery();
          return 'game.id IN ' + subQuery;
        }).where(`game.status = :status`, { status: GameStatus.PendingSecondPlayer });

      const games = await queryGetGames.orderBy(`game."createdAt"`, `DESC`).getMany();

      if (!games?.[0]) {
        return null;
      }

      gameId = games[0].id;
      const player = this.playerRepo.create({ gameId: games[0].id, playerAccountId: user.userId, login: user.login, createdAt: new Date() });
      await this.playerRepo.save(player);

      const questions = await this.questionsRepo
        .createQueryBuilder('q')
        .where(`q.published = :published`, { published: true })
        .orderBy(`RANDOM()`)
        .limit(5)
        .getMany();
      const orderedQuestions = questions.map((q, i) => ({ questionId: q.id, gameId, order: i }));
      await this.questionsOfTheGameRepo.insert(orderedQuestions);

      await this.gameRepo
        .createQueryBuilder('game')
        .update(Game)
        .andWhere(`game.id = :id`, { id: games[0].id })
        .set({ status: GameStatus.Active, startGameDate: new Date() })
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
      .leftJoinAndSelect('game.questions', 'questions')
      .leftJoinAndSelect('questions.question', 'gameQuestion')
      .leftJoinAndSelect('playerProgress.answers', 'answers')
      .where(qb => {
        const subQuery = qb.subQuery()
          .select('playerProgress.gameId')
          .from('PlayerProgress', 'playerProgress')
          .groupBy('"playerProgress"."gameId"')
          .getQuery();
        return 'game.id IN ' + subQuery;
      })
      .andWhere(`game.id = :id`, { id: gameId })
      .addOrderBy('COALESCE("questions".order, 0)', 'ASC')
      .addOrderBy('answers."createdAt"', 'ASC')
      .addOrderBy('"playerProgress"."createdAt"', 'ASC')
      .getOne();

    // console.log(game);
    return GameOutputModelMapper(game);
  }
}