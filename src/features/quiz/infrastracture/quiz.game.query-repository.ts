import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import { Pagination, PaginationOutput } from 'src/base/models/pagination.base.model';
import { Game, GameStatus } from '../domain/game.entity';
import { PlayerProgress } from '../domain/player.entity';
import { QuestionOfTheGame } from '../domain/questionsForGame.entity';
import { PlayerAnswer } from '../domain/playerAnswer.entity';
import { GameOutputModel, GameOutputModelMapper } from '../model/output/game.output.model';
import { AuthUser } from '../quiz.module';
import { MyStatistic, MyStatisticMapper } from '../model/output/my-statistic.output.model';

@Injectable()
export class QuizGameQueryRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
    @InjectRepository(PlayerProgress)
    private readonly playerRepo: Repository<PlayerProgress>,
    @InjectRepository(Question)
    private readonly questionsRepo: Repository<Question>,
    @InjectRepository(QuestionOfTheGame)
    private readonly questionsOfTheGameRepo: Repository<QuestionOfTheGame>,
    @InjectRepository(PlayerAnswer)
    private readonly playerAnswerRepo: Repository<PlayerAnswer>,
  ) { }

  async getAll(
    pagination: Pagination,
    user: AuthUser
  ): Promise<PaginationOutput<GameOutputModel>> {
    const conditions = [];
    const params = [];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const queryGetGames = queryRunner.manager
      .createQueryBuilder(Game, 'g')
      .select(`g.*`)
      .addSelect((qb) => {
        return qb
          .select(
            `COALESCE(
          jsonb_agg(
            json_build_object(
              'id', p.id, 
              'playerAccountId', p."playerAccountId", 
              'login', p.login, 
              'score', p.score, 
              'createdAt', p."createdAt", 
              'answers', (
                SELECT COALESCE(
                  jsonb_agg(
                    json_build_object(
                      'questionId', a."questionId",
                      'createdAt', a."createdAt",
                      'answerStatus', a."answerStatus"
                    ) ORDER BY a."createdAt" ASC
                  ), '[]'::jsonb
                )
                FROM player_answer a
                WHERE a."processId" = p.id
              )
            )
          ) FILTER (WHERE p.id IS NOT NULL), '[]'::jsonb
        ) AS "playersProgresses"`
          )
          .from(PlayerProgress, 'p')
          .where(`p."gameId" = g.id`);
      })
      .addSelect((qb) => {
        return qb
          .select(
            `COALESCE(
          jsonb_agg(
            json_build_object(
              'id', "questionOfGame"."id", 
              'question', json_build_object('body', question.body)
            ) ORDER BY COALESCE("questionOfGame"."order", 0) ASC
          ), '[]'::jsonb
        ) AS questions`
          )
          .from(QuestionOfTheGame, 'questionOfGame')
          .leftJoin(Question, 'question', '"questionOfGame"."questionId" = question.id') // LEFT JOIN to handle missing questions
          .where(`"questionOfGame"."gameId" = g.id`);
      })
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('"playerProgress"."gameId"')
          .from(PlayerProgress, 'playerProgress')
          .where(`"playerProgress"."playerAccountId" = :excludedPlayerAccountId`, { excludedPlayerAccountId: user.userId })
          .groupBy(`"playerProgress"."gameId"`)
          .getQuery();
        return `g.id IN ${subQuery}`;
      })
      .orderBy(`g.${pagination.sortBy}`, pagination.sortDirection)
      .addOrderBy(`g."createdAt"`, 'DESC')
      .take(pagination.pageSize)
      .skip((pagination.pageNumber - 1) * pagination.pageSize);

    const games = await queryGetGames.getRawMany();

    console.log(games, 'vho');

    games.map(e => console.log(e.playersProgresses));
    games.map(e => console.log(e.questions));

    const mappedGames = games.map(e => GameOutputModelMapper(e));
    return new PaginationOutput<GameOutputModel>(
      mappedGames,
      pagination.pageNumber,
      pagination.pageSize,
      Number(games.length),
    );
  }

  async getMyStatistic(
    user: AuthUser
  ): Promise<MyStatistic> {
    const conditions = [];
    const params = [];

    const games = await this.gameRepo
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
      .getMany();
    // console.log(games);
    const checkedGames = games.reduce((acc, g) => {
      const { our, opponent } = g.playersProgresses.reduce((players, p) => {
        if (p.playerAccountId === user.userId) {
          players.our = p.score;
        } else {
          players.opponent = p.score;
        }
        return players;
      }, { our: 0, opponent: 0 });
      if (our - opponent > 0) {
        acc.win++;
      } else if (our - opponent < 0) {
        acc.lose++;
      } else {
        acc.draw++;
      }
      return acc;
    }, { win: 0, lose: 0, draw: 0 });
    const players = await this.playerRepo
      .createQueryBuilder('playerProgress')
      .select('AVG("playerProgress".score)', 'average')
      .addSelect('SUM("playerProgress".score)', 'sum')
      .where(`"playerProgress"."playerAccountId" = :excludedPlayerAccountId`, { excludedPlayerAccountId: user.userId })
      .getRawOne();
    // console.log(players);
    const result = {
      sumScore: Number(players.sum),
      avgScores: parseFloat(Number(players.average).toFixed(2)),
      gamesCount: games.length,
      winsCount: checkedGames.win,
      lossesCount: checkedGames.lose,
      drawsCount: checkedGames.draw,
    };
    return MyStatisticMapper(result);
  }
}
