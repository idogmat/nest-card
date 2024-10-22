import { UserPg } from "src/features/users/domain/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./game.entity";
// @ManyToOne(() => UserPg, (user) => user)
// @Column()
// playerAccount: UserPg;
// Учебная таблица, в которой пока нет всех нужных полей
@Entity()
export class PlayerProgress {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => UserPg, (user) => user.player)
  playerAccount: UserPg;

  @Column({ type: 'uuid' })
  gameId: string;

  @ManyToOne(() => Game, (game) => game.playersProgresses)
  game: Game;
}