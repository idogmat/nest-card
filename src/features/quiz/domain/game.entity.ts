import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PlayerProgress } from "./player.entity";
import { QuestionOfTheGame } from "./questionsForGame.entity";

enum GameStatus {
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

  @OneToMany(() => PlayerProgress, (playerProgress) => playerProgress.game)
  playersProgresses: PlayerProgress[];

  @OneToMany(() => QuestionOfTheGame, (question) => question.game)
  questions: QuestionOfTheGame[];
}