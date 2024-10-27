import { UserPg } from "src/features/users/domain/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./game.entity";
// @ManyToOne(() => UserPg, (user) => user)
// @Column()
// playerAccount: UserPg;
// Учебная таблица, в которой пока нет всех нужных полей
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

  @ManyToOne(() => UserPg, (user) => user.player)
  playerAccount: UserPg;

  @ManyToOne(() => Game, (game) => game.playersProgresses)
  game: Game;
}