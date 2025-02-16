import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Blog } from "../../blogs/domain/blog.entity";
import { User } from "src/features/users/domain/user.entity";
export enum SubscribeStatus {
  None = 'None',
  Subscribed = 'Subscribed',
  Unsubscribed = 'Unsubscribed'
}

@Entity()
export class SubscribeBlog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'enum', enum: SubscribeStatus, default: SubscribeStatus.None })
  status: SubscribeStatus

  @Index()
  @Column({ type: 'uuid' })
  blogId: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Blog, (blog) => blog.subscribers, { onDelete: 'CASCADE' })
  blog: Blog;

  @ManyToOne(() => User, (user) => user.subscribs, { onDelete: 'CASCADE' })
  user: User;
}
