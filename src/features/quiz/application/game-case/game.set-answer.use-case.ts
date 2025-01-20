import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DataSource, Repository } from "typeorm";
import { Game, GameStatus } from "../../domain/game.entity";
import { ForbiddenException } from "@nestjs/common";
import { PlayerProgress } from "../../domain/player.entity";
import { Question } from "../../domain/question.entity";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { TransactionManager } from "src/utils/transaction/transactionManager";
import { PlayerAnswer } from "../../domain/playerAnswer.entity";
import { AnswerOutputModel, AnswerOutputModelMapper } from "../../model/output/answer.output.model";
import { EndGameService } from "../../infrastracture/schedulers/endGame.scheduler";

export class SetAnswerCommand {
  constructor(
    public readonly user: { userId: string, login: string; },
    public readonly answer: string
  ) { }
}

@CommandHandler(SetAnswerCommand)
export class SetAnswerUseCase implements ICommandHandler<SetAnswerCommand> {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
    @InjectRepository(PlayerAnswer)
    private readonly playerAnswerRepo: Repository<PlayerAnswer>,
    private readonly transactionManager: TransactionManager,
    private readonly endGameService: EndGameService

  ) {
    this.transactionManager = new TransactionManager(this.dataSource);
  }

  async execute(command: SetAnswerCommand): Promise<AnswerOutputModel> {
    const { user, answer } = command;
    let answerId: null | string = null;
    let endGameTimerId = null;
    await this.transactionManager.executeInTransaction(async (queryRunner) => {
      const game = await queryRunner.manager
        .createQueryBuilder(Game, 'game')
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
        }).andWhere(`game.status = :active`,
          { active: GameStatus.Active })
        .orderBy(`game."createdAt"`, `ASC`)
        .addOrderBy(`answers."createdAt"`, `ASC`)
        .getOne();
      if (!game) throw new ForbiddenException();
      const processCheck = game.playersProgresses.find(p => (p.playerAccountId === user.userId));
      if (!processCheck?.id) throw new ForbiddenException();
      const answers = await queryRunner.manager.findBy(PlayerAnswer, { processId: processCheck?.id });
      const question = game.questions.find(q => q.order === answers.length);
      if (!question) throw new ForbiddenException();
      const questionForGetAnswer = await queryRunner.manager.findOneBy(Question, { id: question.questionId });
      let points = 0;
      let finished = false;
      const currentAnswers = questionForGetAnswer.correctAnswers.includes(answer) ? 'Correct' : 'Incorrect';
      const opponent = game.playersProgresses.find(p => (p.playerAccountId !== user.userId));
      if (currentAnswers === 'Correct') points++;
      await queryRunner.manager.createQueryBuilder()
        .update(PlayerProgress)
        .set({
          score: () => `score + ${points}`
        })
        .where("id = :processCheck", { processCheck: processCheck.id })
        .execute();

      if (game.questions.length === answers.length + 1
        && game.questions.length !== opponent.answers.length) endGameTimerId = game.id;

      if (game.questions.length === answers.length + 1
        && game.questions.length === opponent.answers.length) {

        const additionalMarkOwner = opponent.score
          ? opponent
          : null;

        if (additionalMarkOwner) {

          await queryRunner.manager.createQueryBuilder()
            .update(PlayerProgress)
            .set({
              score: () => `score + 1`
            })
            .where("id = :processCheck", { processCheck: additionalMarkOwner.id })
            .execute();

        }
        finished = true;

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
      }

      const model = this.playerAnswerRepo.create({
        answer,
        answerStatus: currentAnswers,
        createdAt: new Date(),
        processId: processCheck.id,
        order: answers.length,
        questionId: question.id
      });
      await queryRunner.manager.save(model);
      answerId = model.id;
    });
    const result = await this.playerAnswerRepo.findOneBy({ id: answerId });
    if (endGameTimerId) {
      console.log(endGameTimerId);
      this.endGameService.executeTaskWithDelay(endGameTimerId);
    }

    return AnswerOutputModelMapper(result);
  }
}