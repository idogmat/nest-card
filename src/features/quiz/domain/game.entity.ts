import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PlayerProgress } from "./player.entity";
import { QuestionOfTheGame } from "./questionsForGame.entity";

export enum GameStatus {
  Finished,
  Active,
  PendingSecondUser
}

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'enum', enum: GameStatus, default: GameStatus.PendingSecondUser })
  status: GameStatus;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => PlayerProgress, (playerProgress) => playerProgress.game)
  playersProgresses: PlayerProgress[];

  @OneToMany(() => QuestionOfTheGame, (q) => q.game)
  questions: QuestionOfTheGame[];
}