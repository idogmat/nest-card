
import { Blog } from 'src/features/content/blogs/domain/blog.entity';
import { Device } from './../../../features/devices/domain/device.entity';
import { PlayerProgress } from './../../../features/quiz/domain/player.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BlogBlock } from 'src/features/content/blogs/domain/blog.ban.entity';
import { SubscribeBlog } from 'src/features/content/integrations/domain/integration.entity';

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

  @Column({ nullable: true, default: false })
  banned: boolean;

  @Column({ nullable: true })
  banReason: string;

  @Column({ nullable: true })
  banDate: Date;

  @Column({ nullable: true })
  recoveryCode: string | null;

  @Column({ nullable: true })
  tgId: string | null;

  @OneToMany(() => BlogBlock, (blog) => blog.blogId)
  BlogBlocks: BlogBlock[];

  @OneToMany(() => Blog, (blog) => blog)
  blogs: Blog[];

  @OneToMany(() => Device, (device) => device)
  divices: Device[];

  @OneToMany(() => PlayerProgress, (player) => player.playerAccount)
  player: PlayerProgress[];

  @OneToMany(() => SubscribeBlog, (sub) => sub.user)
  subscribs: SubscribeBlog[];
}
