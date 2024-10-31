import { UserPg } from "src/features/users/domain/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./game.entity";
import { PlayerAnswer } from "./playerAnswer.entity";

@Entity()
export class PlayerProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  playerAccountId: string;

  @Column({ type: 'uuid' })
  gameId: string;

  @Column({ type: 'timestamp' })
  createdAt: Date;

  @Column({ default: 0 })
  score: number;

  @ManyToOne(() => UserPg, (user) => user.player)
  playerAccount: UserPg;

  @ManyToOne(() => Game, (game) => game.playersProgresses)
  game: Game;

  @OneToMany(() => PlayerAnswer, (p) => p.process)
  answers: PlayerAnswer[];
}