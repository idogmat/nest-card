import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DataSource, Repository } from "typeorm";
import { Game } from "../../domain/game.entity";
import { PlayerProgress } from "../../domain/player.entity";
import { GameOutputModel, GameOutputModelMapper } from "../../model/output/game.output.model";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";

export class CreateGamePairCommand {
  constructor(
    public readonly user: { userId: string, login: string; }
  ) { }
}

@CommandHandler(CreateGamePairCommand)
export class CreateGamePairUseCase implements ICommandHandler<CreateGamePairCommand> {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
    @InjectRepository(PlayerProgress)
    private readonly playerRepo: Repository<PlayerProgress>,
  ) { }

  async execute(command: CreateGamePairCommand): Promise<boolean | GameOutputModel> {
    const { user } = command;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    let result = null;
    let gameId = null;
    try {
      const game = this.gameRepo.create({ createdAt: new Date() });
      await queryRunner.manager.save(game);
      const player = this.playerRepo.create({ gameId: game.id, playerAccountId: user.userId, login: user.login, createdAt: new Date() });
      await queryRunner.manager.save(player);
      gameId = game.id;
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
          .groupBy('"playerProgress"."gameId"')
          .getQuery();
        return 'game.id IN ' + subQuery;
      })
      .where(`game.id = :id`, { id: gameId })
      .orderBy(`game."createdAt"`, `ASC`)
      .addOrderBy('"playerProgress"."createdAt"', 'ASC')
      .getOne();
    return GameOutputModelMapper(result);
  }
}