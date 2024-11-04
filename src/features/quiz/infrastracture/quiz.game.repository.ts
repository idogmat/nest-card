import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Equal, LessThan, Not, Repository } from 'typeorm';
import { Question } from '../domain/question.entity';
import { Game, GameStatus } from '../domain/game.entity';
import { PlayerProgress } from '../domain/player.entity';
import { QuestionOfTheGame } from '../domain/questionsForGame.entity';
import { PlayerAnswer } from '../domain/playerAnswer.entity';
import { GameOutputModelMapper } from '../model/output/game.output.model';
import { AuthUser } from '../quiz.module';



@Injectable()
export class QuizGameRepository {
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
    @InjectRepository(PlayerAnswer)
    private readonly playerAnswerRepo: Repository<PlayerAnswer>,
  ) { }

  async createGame(user: AuthUser): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let result = null;
    try {
      const game = this.gameRepo.create({ createdAt: new Date() });
      await queryRunner.manager.save(game);
      const player = this.playerRepo.create({ gameId: game.id, playerAccountId: user.userId, login: user.login, createdAt: new Date() });
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
          .where('"playerProgress"."playerAccountId" = :excludedPlayerAccountId', { excludedPlayerAccountId: user.userId })
          .groupBy('"playerProgress"."gameId"')
          .having('COUNT("playerProgress".id) < :maxPlayers', { maxPlayers: 2 })
          .getQuery();
        return 'game.id IN ' + subQuery;
      }).orderBy(`game."createdAt"`, `ASC`).getOne();
    return GameOutputModelMapper(result);
  }

  async findPair(user: AuthUser): Promise<any> {
    const games = await this.gameRepo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.playersProgresses', 'playerProgress')
      .where(qb => {
        const subQuery = qb.subQuery()
          .select('playerProgress.gameId')
          .from('PlayerProgress', 'playerProgress')
          .groupBy('"playerProgress"."gameId"')
          .getQuery();
        return 'game.id IN ' + subQuery;
      }).andWhere(`(game.status = :pending OR game.status = :active)`,
        { pending: GameStatus.PendingSecondPlayer, active: GameStatus.Active })
      .orderBy(`game."createdAt"`, `ASC`).getMany();
    // throw err if user have active game
    const currentGame = games.reduce((acc, g) => {
      if (!g.finishGameDate) acc = g;
      return acc;
    }, {} as Game | null);
    console.log(currentGame, 'currentGame');
    const checkCurrentGamePlayerId = currentGame?.playersProgresses?.find(p => p?.playerAccountId === user.userId)?.id;
    console.log(checkCurrentGamePlayerId, 'checkCurrentGamePlayerId');
    if (checkCurrentGamePlayerId) throw new ForbiddenException();
    let gameId = null;
    // const queryRunner = this.dataSource.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();
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


      // await queryRunner.commitTransaction();
    } catch (e) {
      // await queryRunner.rollbackTransaction();
    } finally {
      // await queryRunner.release();
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
      .getOne();

    console.log(game);
    return GameOutputModelMapper(game);
  }

  async findGame(user: AuthUser): Promise<any> {
    const currentGame = await this.gameRepo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.playersProgresses', 'playerProgress')
      .leftJoinAndSelect('game.questions', 'questions')
      .leftJoinAndSelect('questions.question', 'gameQuestion')
      .leftJoinAndSelect('playerProgress.answers', 'answers')
      .where(qb => {
        const subQuery = qb.subQuery()
          .select('playerProgress.gameId')
          .from('PlayerProgress', 'playerProgress')
          .where('"playerProgress"."playerAccountId" = :excludedPlayerAccountId', { excludedPlayerAccountId: user.userId })
          .groupBy('"playerProgress"."gameId"')
          .getQuery();
        return 'game.id IN ' + subQuery;
      })
      .andWhere(`(game.status = :pending OR game.status = :active)`,
        { pending: GameStatus.PendingSecondPlayer, active: GameStatus.Active })
      .orderBy('"playerProgress"."createdAt"', 'ASC')
      .addOrderBy('"gameQuestion"."createdAt"', 'ASC')
      .addOrderBy('answers.order', 'ASC').getOne();

    if (!currentGame?.id) throw new NotFoundException();

    return GameOutputModelMapper(currentGame);
    // return currentGame;
  }

  async getGameById(id: string, user: AuthUser): Promise<any> {
    const validateGame = await this.playerRepo
      .createQueryBuilder('p')
      .where(`p."gameId" = :id`, { id })
      .getMany();
    console.log(validateGame, 'validateGame');
    const playersForMatch = validateGame.reduce((acc, p) => {
      acc.push(p.playerAccountId);
      return acc;
    }, []);
    if (!playersForMatch.length) throw new NotFoundException();
    if (!playersForMatch.includes(user.userId)) throw new ForbiddenException();

    const currentGame = await this.gameRepo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.playersProgresses', 'playerProgress')
      .leftJoinAndSelect('game.questions', 'questions')
      .leftJoinAndSelect('questions.question', 'gameQuestion')
      .leftJoinAndSelect('playerProgress.answers', 'answers')
      .where("game.id = :id", { id })
      .orderBy('"playerProgress"."createdAt"', 'ASC')
      .addOrderBy('COALESCE(answers.order, 0)', 'ASC')
      .addOrderBy('"gameQuestion"."createdAt"', 'ASC').getOne();

    return GameOutputModelMapper(currentGame);
  }

  async setAnswer(user: AuthUser, answer: string): Promise<any> {
    const queryGetGames = this.gameRepo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.playersProgresses', 'playerProgress')
      .leftJoinAndSelect('game.questions', 'questions')
      .where(qb => {
        const subQuery = qb.subQuery()
          .select('playerProgress.gameId')
          .from('PlayerProgress', 'playerProgress')
          .where('"playerProgress"."playerAccountId" = :excludedPlayerAccountId', { excludedPlayerAccountId: user.userId })
          .groupBy('"playerProgress"."gameId"')
          .getQuery();
        return 'game.id IN ' + subQuery;
      });

    const game = await queryGetGames.orderBy(`game."createdAt"`, `ASC`).getOne();
    console.log(game);
    if (!game) throw new ForbiddenException();
    const processCheck = game.playersProgresses.find(p => (p.playerAccountId === user.userId));
    if (!processCheck?.id) throw new ForbiddenException();
    // console.log(playerCheck);
    console.log(game.questions);
    const answers = await this.playerAnswerRepo.find({ where: { processId: processCheck?.id } });
    console.log(answers, 'anwsers');
    const question = game.questions.find(q => q.order === answers.length);
    let points = 0;
    let finished = false;
    if (!question) throw new ForbiddenException();

    console.log(game.questions);
    console.log(answers);
    const questionForGetAnswer = await this.questionsRepo.findOneBy({ id: question.questionId });
    console.log(questionForGetAnswer, 'questionForGetAnswer');

    const currentAnswers = questionForGetAnswer.correctAnswers.includes(answer) ? 'Correct' : 'Incorrect';
    if (game.questions.length === answers.length + 1) {
      const processId = game.playersProgresses.find(p => (p.playerAccountId !== user.userId)).id;
      const opponentAnwswers = await this.playerAnswerRepo.find({ where: { processId } });
      console.log(opponentAnwswers, 'opponentAnwswers');
      // const resultAnswersArr = answers.map(a => (a.answer));
      // resultAnswersArr.push(answer);
      // console.log(resultAnswersArr, 'resultAnswersArr');
      if (game.questions.length > opponentAnwswers.length && (processCheck.score || currentAnswers === 'Correct')) points++;
      else finished = true;
    }
    if (currentAnswers === 'Correct') points++;
    console.log(currentAnswers, 'currentAnswers');
    console.log(points);

    await this.playerRepo.createQueryBuilder()
      .update(PlayerProgress)
      .set({
        score: () => `score + ${points}`
      })
      .where("id = :processCheck", { processCheck: processCheck.id })
      .returning("*")
      .execute();
    if (finished) {
      await this.gameRepo.createQueryBuilder()
        .update(Game)
        .set({
          finishGameDate: new Date(),
          status: GameStatus.Finished
        })
        .where("id = :gameId", { gameId: processCheck.gameId })
        .execute();
    }

    const model = this.playerAnswerRepo.create({
      answer,
      answerStatus: currentAnswers,
      createdAt: new Date(),
      processId: processCheck.id,
      order: answers.length,
      questionId: question.id
    });
    await this.playerAnswerRepo.save(model);
  }
}
