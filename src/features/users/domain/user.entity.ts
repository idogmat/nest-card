
import { DevicePg } from 'src/features/devices/domain/device.entity';
import { PlayerProgress } from 'src/features/quiz/domain/player.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserPg {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'varchar', collation: 'C' })
  login: string;

  @Column({ type: 'varchar', collation: 'C' })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  passwordSalt: string;

  @Column()
  createdAt: Date;

  @Column()
  confirmationCode: string;

  @Column({ nullable: true })
  expirationDate: Date;

  @Column()
  isConfirmed: boolean;

  @Column({ nullable: true })
  recoveryCode: string | null;

  @OneToMany(() => DevicePg, (device) => device)
  divices: DevicePg[];

  @OneToMany(() => PlayerProgress, (player) => player.playerAccount)
  player: PlayerProgress[];
}
