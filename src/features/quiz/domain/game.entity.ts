import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PlayerProgress } from "./player.entity";
import { QuestionOfTheGame } from "./questionsForGame.entity";

export enum GameStatus {
  PendingSecondPlayer,
  Active,
  Finished,
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'enum', enum: GameStatus, default: GameStatus.PendingSecondPlayer })
  status: GameStatus;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  startGameDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  finishGameDate: Date | null;

  @OneToMany(() => PlayerProgress, (playerProgress) => playerProgress.game)
  playersProgresses: PlayerProgress[];

  @OneToMany(() => QuestionOfTheGame, (q) => q.game)
  questions: QuestionOfTheGame[];
}