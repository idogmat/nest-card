
import { Blog } from 'src/features/content/blogs/domain/blog.entity';
import { Device } from './../../../features/devices/domain/device.entity';
import { PlayerProgress } from './../../../features/quiz/domain/player.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
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

  @OneToMany(() => Blog, (blog) => blog)
  blogs: Blog[];

  @OneToMany(() => Device, (device) => device)
  divices: Device[];

  @OneToMany(() => PlayerProgress, (player) => player.playerAccount)
  player: PlayerProgress[];
}
